import { Controller, Get, Param, Query, Post, Req, UnauthorizedException } from '@nestjs/common';
import { TracksService } from './tracks.service';

interface RequestWithUser {
  user: {
    id: string;
  };
}

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
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
    return this.tracksService.findAll(req.user.id, +page, +limit, search, genre, year, order, randomSeed);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.findOne(id, req.user.id);
  }

  @Post(':id/plays')
  incrementPlays(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.incrementPlays(id, req.user.id);
  }
}
