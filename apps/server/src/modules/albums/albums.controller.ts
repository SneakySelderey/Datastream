import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AlbumsService } from './albums.service';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@ApiTags('albums')
@ApiCookieAuth()
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @ApiOperation({ summary: 'List albums' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 18 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'genre', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'artistId', required: false })
  @ApiQuery({ name: 'order', required: false, example: 'default' })
  @ApiQuery({ name: 'randomSeed', required: false })
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('genre') genre = '',
    @Query('year') year = '',
    @Query('artistId') artistId = '',
    @Query('order') order = 'default',
    @Query('randomSeed') randomSeed = '',
  ) {
    return this.albumsService.findAll(
      req.user.id,
      +page,
      +limit,
      search,
      genre,
      year,
      artistId,
      order,
      randomSeed,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get album by id' })
  @ApiParam({ name: 'id', example: 'album-id' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.albumsService.findOne(id, req.user.id);
  }
}
