// src/playlists/playlists.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ManageTracksDto } from './dto/manage-tracks.dto';

@ApiTags('playlists')
@ApiCookieAuth()
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @ApiOperation({ summary: 'Create playlist' })
  @ApiBody({ type: CreatePlaylistDto })
  @SetMetadata('auditAction', { value: 'CREATE', entityType: 'Playlist' })
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Req() req) {
    return this.playlistsService.create(req.user.id, createPlaylistDto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user playlists' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Req() req, @Query('search') search: string) {
    return this.playlistsService.findAll(req.user.id, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get playlist by id' })
  @ApiParam({ name: 'id', example: 'playlist-id' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.playlistsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update playlist' })
  @ApiParam({ name: 'id', example: 'playlist-id' })
  @ApiBody({ type: UpdatePlaylistDto })
  @SetMetadata('auditAction', { value: 'UPDATE', entityType: 'Playlist' })
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Patch(':id/add')
  @ApiOperation({ summary: 'Add tracks to playlist' })
  @ApiParam({ name: 'id', example: 'playlist-id' })
  @ApiBody({ type: ManageTracksDto })
  addTracks(@Param('id') id: string, @Body() manageTracksDto: ManageTracksDto) {
    return this.playlistsService.addTracks(id, manageTracksDto);
  }

  @Patch(':id/remove')
  @ApiOperation({ summary: 'Remove tracks from playlist' })
  @ApiParam({ name: 'id', example: 'playlist-id' })
  @ApiBody({ type: ManageTracksDto })
  removeTracks(
    @Param('id') id: string,
    @Body() manageTracksDto: ManageTracksDto,
  ) {
    return this.playlistsService.removeTracks(id, manageTracksDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete playlist' })
  @ApiParam({ name: 'id', example: 'playlist-id' })
  @SetMetadata('auditAction', { value: 'DELETE', entityType: 'Playlist' })
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }
}
