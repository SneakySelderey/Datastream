import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ManageTracksDto } from './dto/manage-tracks.dto';
import {
  matchesNormalizedSearch,
  normalizeSearchQuery,
} from '../../common/search-normalization';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPlaylistDto: CreatePlaylistDto) {
    const { title, trackIds } = createPlaylistDto;

    return this.prisma.playlist.create({
      data: {
        title,
        userId,
        tracks: {
          connect: trackIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findAll(userId: string, search?: string) {
    const where: any = { userId };
    const normalizedSearch = normalizeSearchQuery(search);

    const playlists = await this.prisma.playlist.findMany({
      where,
      include: {
        _count: { select: { tracks: true } },
        tracks: {
          take: 1,
          include: { album: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    return playlists.filter((playlist) =>
      matchesNormalizedSearch([playlist.title], normalizedSearch),
    );
  }

  async findOne(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          include: {
            album: true,
            artists: true,
            genres: true,
            playStats: { where: { userId } },
          },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.userId !== userId) {
      throw new ForbiddenException('You do not have access to this playlist');
    }

    const tracks = playlist.tracks.map(({ playStats, ...rest }) => ({
      ...rest,
      plays: playStats?.[0]?.plays ?? 0,
    }));

    return { ...playlist, tracks };
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: { title: updatePlaylistDto.title },
    });
  }

  async addTracks(id: string, dto: ManageTracksDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: {
        tracks: {
          connect: dto.trackIds.map((trackId) => ({ id: trackId })),
        },
      },
    });
  }

  async removeTracks(id: string, dto: ManageTracksDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: {
        tracks: {
          disconnect: dto.trackIds.map((trackId) => ({ id: trackId })),
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.playlist.delete({ where: { id } });
  }
}
