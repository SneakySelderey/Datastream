import { Controller, Get, Param, Query } from '@nestjs/common';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('genre') genre = '',
    @Query('year') year = '',
    @Query('sort') sort = 'default',
  ) {
    return this.tracksService.findAll(+page, +limit, search, genre, year, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }
}