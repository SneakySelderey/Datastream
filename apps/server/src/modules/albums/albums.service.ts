import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    genre?: string,
    year?: string,
    artistId?: string,
    sort?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { artists: { some: { name: { contains: search } } } },
      ];
    }

    if (genre) {
      where.tracks = { some: { genres: { some: { name: genre } } } };
    }

    if (year) {
      where.date = { contains: year };
    }

    if (artistId) {
      where.artists = { some: { id: artistId } };
    }

    let orderBy: any = { title: 'asc' };

    if (sort === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'random') {
      orderBy = { id: 'asc' };
    }

    if (sort === 'most-played') {
      const albums = await this.prisma.album.findMany({
        where,
        include: {
          artists: true,
          tracks: {
            include: {
              playStats: { where: { userId } },
            },
            orderBy: { number: 'asc' },
          },
        },
      });

      const withPlays = albums.map(album => {
        const totalPlays = album.tracks.reduce((sum, track) => {
          const plays = track.playStats.reduce((acc, ps) => acc + ps.plays, 0);
          return sum + plays;
        }, 0);

        const coverPath = album.tracks.find(t => t.coverPath)?.coverPath ?? null;
        return { ...album, coverPath, totalPlays };
      });

      const sorted = withPlays.sort((a, b) => {
        if (b.totalPlays !== a.totalPlays) return b.totalPlays - a.totalPlays;
        return a.title.localeCompare(b.title);
      });

      const paged = sorted.slice(skip, skip + Number(limit)).map(({ totalPlays, ...album }) => album);

      const allGenres = await this.prisma.genre.findMany({ select: { name: true } });
      const allAlbumsDates = await this.prisma.album.findMany({
        select: { date: true },
        distinct: ['date'],
        where: { date: { not: null } },
      });

      const uniqueYears = [...new Set(
        allAlbumsDates.map(a => a.date?.substring(0, 4)).filter(Boolean)
      )].sort().reverse();

      return {
        data: paged,
        total: sorted.length,
        meta: {
          genres: allGenres.map(g => g.name),
          years: uniqueYears,
        },
      };
    }

    const [albums, total, allGenres, allAlbumsDates] = await Promise.all([
      this.prisma.album.findMany({
        skip,
        take: Number(limit),
        where,
        include: {
          artists: true,
          tracks: {
            select: { coverPath: true },
            orderBy: { number: 'asc' },
            take: 1,
          },
        },
        orderBy,
      }),
      this.prisma.album.count({ where }),
      this.prisma.genre.findMany({ select: { name: true } }),
      this.prisma.album.findMany({
        select: { date: true },
        distinct: ['date'],
        where: { date: { not: null } },
      }),
    ]);

    const data = albums.map(album => {
      const coverPath = album.tracks[0]?.coverPath ?? null;
      return { ...album, coverPath };
    });

    const uniqueYears = [...new Set(
      allAlbumsDates.map(a => a.date?.substring(0, 4)).filter(Boolean)
    )].sort().reverse();

    return {
      data,
      total,
      meta: {
        genres: allGenres.map(g => g.name),
        years: uniqueYears,
      },
    };
  }
  
  async findOne(id: string, userId: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artists: true,
        tracks: {
          include: {
            artists: true,
            genres: true,
            album: true,
            playStats: { where: { userId } },
          },
          orderBy: { number: 'asc' },
        },
      },
    });
    
    if (!album) return null;

    const tracks = album.tracks.map(({ playStats, ...rest }) => ({
      ...rest,
      plays: playStats?.[0]?.plays ?? 0,
    }));

    const coverPath = tracks.find(t => t.coverPath)?.coverPath ?? null;
    return { ...album, coverPath, tracks };
  }
}
