import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page: number, 
    limit: number, 
    search?: string, 
    order?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ArtistWhereInput = {};

    if (search) {
      where.name = { contains: search }; 
    }

    let orderBy: Prisma.ArtistOrderByWithRelationInput = { name: 'asc' };

    if (order === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    } else if (order === 'random') {
      orderBy = { id: 'asc' }; 
    }

    const [artists, total] = await Promise.all([
      this.prisma.artist.findMany({
        skip,
        take: Number(limit),
        where,
        orderBy,
        include: {
          _count: {
            select: { albums: true, tracks: true },
          },
          tracks: {
            select: { size: true }
          }
        },
      }),
      this.prisma.artist.count({ where }),
    ]);

    const formattedArtists = artists.map((artist) => {
      const totalSize = artist.tracks.reduce((acc, t) => acc + t.size, 0);

      return {
        id: artist.id,
        name: artist.name,
        albums: [], 
        tracks: [],
        albumCount: artist._count.albums,
        songCount: artist._count.tracks,
        size: totalSize,
        plays: 0,
      };
    });

    return {
      data: formattedArtists,
      total,
    };
  }

  async findOne(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          orderBy: { date: 'desc' },
        },
        tracks: {
          orderBy: { title: 'asc' },
          include: {
             album: true,
             genres: true,
             artists: true
          }
        },
        _count: {
            select: { albums: true, tracks: true }
        }
      }
    });

    if (!artist) throw new NotFoundException('Artist not found');

    const totalSize = artist.tracks.reduce((acc, t) => acc + t.size, 0);

    const formattedAlbums = artist.albums.map(album => ({
      ...album,
      artists: [artist],
      artistId: artist.id,
      tracks: [],
      genres: [],
      trackCount: 0,
    }));

    return {
      id: artist.id,
      name: artist.name,
      albums: formattedAlbums,
      tracks: artist.tracks,
      albumCount: artist._count.albums,
      songCount: artist._count.tracks,
      size: totalSize.toString(),
      plays: 0
    };
  }
}