import { Controller, Get, Param, Req } from '@nestjs/common';
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
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.albumsService.findOne(id, req.user.id);
  }
}
