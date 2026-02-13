import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('order') order = 'default',
  ) {
    return this.artistsService.findAll(+page, +limit, search, order);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }
}
