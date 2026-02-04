import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { AlbumsService } from './albums.service';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('genre') genre = '',
    @Query('year') year = '',
    @Query('artistId') artistId = '',
    @Query('sort') sort = 'default',
  ) {
    return this.albumsService.findAll(req.user.id, +page, +limit, search, genre, year, artistId, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.albumsService.findOne(id, req.user.id);
  }
}
