import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  matchesNormalizedSearch,
  normalizeSearchQuery,
} from '../../common/search-normalization';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number, search?: string, order?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ArtistWhereInput = {};
    const normalizedSearch = normalizeSearchQuery(search);

    let orderBy: Prisma.ArtistOrderByWithRelationInput = { name: 'asc' };

    if (order === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    } else if (order === 'random') {
      orderBy = { id: 'asc' };
    }

    if (!normalizedSearch) {
      const whereWithAlbums = { ...where, albums: { some: {} } };
      const [artists, total] = await Promise.all([
        this.prisma.artist.findMany({
          skip,
          take: Number(limit),
          where: whereWithAlbums,
          orderBy,
          include: {
            _count: {
              select: { albums: true, tracks: true },
            },
            tracks: {
              select: { size: true },
            },
          },
        }),
        this.prisma.artist.count({ where: whereWithAlbums }),
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

    const artists = await this.prisma.artist.findMany({
      where: {
        ...where,
        albums: { some: {} },
      },
      orderBy,
      include: {
        _count: {
          select: { albums: true, tracks: true },
        },
        tracks: {
          select: { size: true },
        },
      },
    });
    const filteredArtists = artists.filter((artist) =>
      matchesNormalizedSearch([artist.name], normalizedSearch),
    );

    const formattedArtists = filteredArtists
      .slice(skip, skip + Number(limit))
      .map((artist) => {
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
      total: filteredArtists.length,
    };
  }

  async findOne(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        _count: {
          select: { albums: true, tracks: true },
        },
      },
    });

    if (!artist) throw new NotFoundException('Artist not found');

    return {
      id: artist.id,
      name: artist.name,
      createdAt: artist.createdAt,
      albums: [],
      tracks: [],
      albumCount: artist._count.albums,
      songCount: artist._count.tracks,
      size: '0',
      plays: 0,
    };
  }
}
