import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ManageTracksDto } from './dto/manage-tracks.dto';

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
    
    if (search) {
      where.title = { contains: search };
    }

    const playlists = await this.prisma.playlist.findMany({
      where,
      include: {
        _count: { select: { tracks: true } },
        tracks: { 
          take: 1, 
          include: { album: true },
          orderBy: { createdAt: 'desc' }
        } 
      },
      orderBy: { title: 'asc' }
    });

    return playlists.map(p => ({
      id: p.id,
      title: p.title,
      artists: [{ id: 'va', name: 'Various Artists' }],
      artistId: 'va',
      date: p.createdAt.toISOString(),
      trackCount: p._count.tracks,
      cover: p.tracks[0]?.album?.coverPath 
        ? `http://localhost:3000/stream/cover/${p.tracks[0].album.coverPath}` 
        : null,
      size: '0',
      duration: '0'
    }));
  }

  async findOne(id: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        tracks: {
          include: {
            album: true,
            artists: true,
            genres: true
          },
        }
      }
    });

    if (!playlist) throw new NotFoundException('Playlist not found');
    
    if (playlist.userId !== userId) {
      throw new ForbiddenException('You do not have access to this playlist');
    }

    const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
    const totalSize = playlist.tracks.reduce((acc, t) => acc + t.size, 0);

    return {
      id: playlist.id,
      title: playlist.title,
      artists: [{ id: 'va', name: 'Various Artists' }],
      artistId: 'va',
      date: playlist.createdAt.toISOString(),
      
      cover: playlist.tracks[0]?.album?.coverPath 
        ? `http://localhost:3000/stream/cover/${playlist.tracks[0].album.coverPath}` 
        : null,
      
      genres: [],
      
      tracks: playlist.tracks.map(t => ({
        id: t.id,
        title: t.title,
        
        album: t.album, 
        albumId: t.albumId,
        artists: t.artists, 
        artistId: t.artists[0]?.id,
        
        number: t.number,
        duration: t.duration,
        src: `http://localhost:3000/stream/track/${t.id}`,
        size: t.size,
        format: t.format,
        genres: t.genres,
        coverPath: t.coverPath ? `http://localhost:3000/stream/cover/${t.coverPath}` : null
      })),
      
      trackCount: playlist.tracks.length,
      duration: totalDuration, 
      size: totalSize
    };
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: { title: updatePlaylistDto.title }
    });
  }

  async addTracks(id: string, dto: ManageTracksDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: {
        tracks: {
          connect: dto.trackIds.map(trackId => ({ id: trackId }))
        }
      }
    });
  }

  async removeTracks(id: string, dto: ManageTracksDto) {
    return this.prisma.playlist.update({
      where: { id },
      data: {
        tracks: {
          disconnect: dto.trackIds.map(trackId => ({ id: trackId }))
        }
      }
    });
  }
  
  async remove(id: string) {
    return this.prisma.playlist.delete({ where: { id } });
  }
}