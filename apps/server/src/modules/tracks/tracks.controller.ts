import { Controller, Get, Param, Query, Post, Req } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TracksService } from './tracks.service';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@ApiTags('tracks')
@ApiCookieAuth()
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @ApiOperation({ summary: 'List tracks' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 18 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'genre', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'order', required: false, example: 'default' })
  @ApiQuery({ name: 'randomSeed', required: false })
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('genre') genre = '',
    @Query('year') year = '',
    @Query('order') order = 'default',
    @Query('randomSeed') randomSeed = '',
  ) {
    return this.tracksService.findAll(
      req.user.id,
      +page,
      +limit,
      search,
      genre,
      year,
      order,
      randomSeed,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get track by id' })
  @ApiParam({ name: 'id', example: 'track-id' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.findOne(id, req.user.id);
  }

  @Post(':id/plays')
  @ApiOperation({ summary: 'Increment current user play count for a track' })
  @ApiParam({ name: 'id', example: 'track-id' })
  incrementPlays(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.incrementPlays(id, req.user.id);
  }
}
