import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
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

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        skip,
        take: Number(limit),
        where,
        orderBy,
        include: {
          album: true,
          artists: true,
          genres: true,
        },
      }),
      this.prisma.track.count({ where }),
    ]);

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
      data: tracks,
      total,
      meta: {
        genres: allGenres.map(g => g.name),
        years: uniqueYears
      }
    };
  }

  async findOne(id: string) {
    return this.prisma.track.findUnique({
      where: { id },
      include: { album: true, artists: true, genres: true }
    });
  }
}