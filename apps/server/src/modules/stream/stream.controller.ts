import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { type Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('stream')
@ApiCookieAuth()
@Controller('stream')
export class StreamController {
  private coversCachePath: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.coversCachePath = this.configService.get<string>(
      'COVERS_CACHE_PATH',
      '/data/covers',
    );
  }

  @Get('cover/:filename')
  @ApiOperation({ summary: 'Stream cached album cover' })
  @ApiParam({ name: 'filename', example: 'cover-hash.jpg' })
  @ApiProduces('image/jpeg', 'image/png')
  getCover(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const path = join(this.coversCachePath, filename);

    if (!existsSync(path)) {
      throw new NotFoundException('Cover not found');
    }

    const mimeType =
      extname(filename).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    res.setHeader('Content-Type', mimeType);

    const file = createReadStream(path);
    return new StreamableFile(file);
  }

  @Get('track/:id')
  @ApiOperation({ summary: 'Stream audio track file' })
  @ApiParam({ name: 'id', example: 'track-id' })
  @ApiProduces(
    'audio/mpeg',
    'audio/wav',
    'audio/flac',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',
  )
  async getTrack(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const track = await this.prisma.track.findUnique({ where: { id } });

    if (!track || !existsSync(track.filePath)) {
      throw new NotFoundException('Track file not found');
    }

    const stat = statSync(track.filePath);
    const fileSize = stat.size;
    const fileFormat = track.format;

    const mimeTypes = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      flac: 'audio/flac',
      ogg: 'audio/ogg',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
    };

    res.set({
      'Content-Type': mimeTypes[fileFormat.toLowerCase()],
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
      'Content-Disposition': 'inline',
    });

    const file = createReadStream(track.filePath);
    return new StreamableFile(file);
  }
}
