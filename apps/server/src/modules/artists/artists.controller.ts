import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistsService } from './artists.service';

@ApiTags('artists')
@ApiCookieAuth()
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @ApiOperation({ summary: 'List artists' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 18 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'order', required: false, example: 'default' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 18,
    @Query('search') search = '',
    @Query('order') order = 'default',
  ) {
    return this.artistsService.findAll(+page, +limit, search, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by id' })
  @ApiParam({ name: 'id', example: 'artist-id' })
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }
}
