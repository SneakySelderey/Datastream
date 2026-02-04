import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    genre?: string,
    year?: string,
    sort?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.TrackWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { artists: { some: { name: { contains: search } } } }
      ];
    }

    if (genre) {
      where.genres = { some: { name: genre } };
    }

    if (year) {
      where.date = { contains: year };
    }

    let orderBy: Prisma.TrackOrderByWithRelationInput = { title: 'asc' };

    if (sort === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'random') {
      orderBy = { id: 'asc' }; 
    }

    const include: Prisma.TrackInclude = {
      album: true,
      artists: true,
      genres: true,
      playStats: { where: { userId } },
    };

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        skip,
        take: Number(limit),
        where,
        orderBy,
        include,
      }),
      this.prisma.track.count({ where }),
    ]);

    const data = tracks.map(({ playStats, ...rest }) => ({
      ...rest,
      plays: playStats?.[0]?.plays ?? 0,
    }));

    const allGenres = await this.prisma.genre.findMany({ select: { name: true } });
    const allTracksDates = await this.prisma.track.findMany({ 
        select: { date: true }, 
        distinct: ['date'],
        where: { date: { not: null } }
    });
    
    const uniqueYears = [...new Set(
        allTracksDates.map(t => t.date?.substring(0, 4)).filter(Boolean)
    )].sort().reverse();

    return {
      data,
      total,
      meta: {
        genres: allGenres.map(g => g.name),
        years: uniqueYears
      }
    };
  }

  async findOne(id: string, userId: string) {
    const include: Prisma.TrackInclude = {
      album: true,
      artists: true,
      genres: true,
      playStats: { where: { userId } },
    };

    const track = await this.prisma.track.findUnique({
      where: { id },
      include,
    });

    if (!track) return null;

    const { playStats, ...rest } = track;
    return { ...rest, plays: playStats?.[0]?.plays ?? 0 };
  }

  async incrementPlays(trackId: string, userId: string) {
    if (!userId) throw new UnauthorizedException('User not found');

    const result = await this.prisma.trackPlay.upsert({
      where: { userId_trackId: { userId, trackId } },
      create: { userId, trackId, plays: 1 },
      update: { plays: { increment: 1 } },
    });

    return { trackId, plays: result.plays };
  }
}