// src/playlists/playlists.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ManageTracksDto } from './dto/manage-tracks.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Req() req) {
    return this.playlistsService.create(req.user.id, createPlaylistDto);
  }

  @Get()
  findAll(@Req() req, @Query('search') search: string) {
    return this.playlistsService.findAll(req.user.id, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.playlistsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Patch(':id/add')
  addTracks(@Param('id') id: string, @Body() manageTracksDto: ManageTracksDto) {
    return this.playlistsService.addTracks(id, manageTracksDto);
  }

  @Patch(':id/remove')
  removeTracks(@Param('id') id: string, @Body() manageTracksDto: ManageTracksDto) {
    return this.playlistsService.removeTracks(id, manageTracksDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }
}