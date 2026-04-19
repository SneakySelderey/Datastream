import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import {
  matchesNormalizedSearch,
  normalizeSearchQuery,
} from '../../common/search-normalization';

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
    order?: string,
    randomSeed?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.TrackWhereInput = {};
    const normalizedSearch = normalizeSearchQuery(search);

    if (genre) {
      where.genres = { some: { name: genre } };
    }

    if (year) {
      where.date = { contains: year };
    }

    const include: Prisma.TrackInclude = {
      album: true,
      artists: true,
      genres: true,
      playStats: { where: { userId } },
    };

    let orderBy: Prisma.TrackOrderByWithRelationInput = { title: 'asc' };

    if (order === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    }

    if (order === 'most-played') {
      const tracks = await this.prisma.track.findMany({
        where,
        include,
      });

      const sorted = tracks
        .filter((track) =>
          matchesNormalizedSearch(
            [track.title, ...track.artists.map((artist) => artist.name)],
            normalizedSearch,
          ),
        )
        .map(({ playStats, ...rest }) => ({
          ...rest,
          plays: playStats?.[0]?.plays ?? 0,
        }))
        .sort(
          (a, b) =>
            b.plays - a.plays ||
            a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
        );

      const data = sorted.slice(skip, skip + Number(limit));

      const allGenres = await this.prisma.genre.findMany({
        select: { name: true },
      });
      const allTracksDates = await this.prisma.track.findMany({
        select: { date: true },
        distinct: ['date'],
        where: { date: { not: null } },
      });

      const uniqueYears = [
        ...new Set(
          allTracksDates.map((t) => t.date?.substring(0, 4)).filter(Boolean),
        ),
      ]
        .sort()
        .reverse();

      return {
        data,
        total: sorted.length,
        meta: {
          genres: allGenres.map((g) => g.name),
          years: uniqueYears,
        },
      };
    }

    if (order === 'recently-played') {
      const [tracks, allGenres, allTracksDates] = await Promise.all([
        this.prisma.track.findMany({
          where,
          include,
        }),
        this.prisma.genre.findMany({ select: { name: true } }),
        this.prisma.track.findMany({
          select: { date: true },
          distinct: ['date'],
          where: { date: { not: null } },
        }),
      ]);

      const sorted = tracks
        .filter((track) =>
          matchesNormalizedSearch(
            [track.title, ...track.artists.map((artist) => artist.name)],
            normalizedSearch,
          ),
        )
        .map((track) => {
          const { playStats, ...rest } = track;
          return {
            ...rest,
            plays: playStats?.[0]?.plays ?? 0,
            lastPlayedAt: playStats?.[0]?.updatedAt ?? null,
          };
        })
        .sort((a, b) => {
          const aPlayed = a.lastPlayedAt ? a.lastPlayedAt.getTime() : 0;
          const bPlayed = b.lastPlayedAt ? b.lastPlayedAt.getTime() : 0;

          if (aPlayed !== bPlayed) return bPlayed - aPlayed;
          return a.title.localeCompare(b.title, undefined, {
            sensitivity: 'base',
          });
        });

      const data = sorted
        .slice(skip, skip + Number(limit))
        .map(({ lastPlayedAt, ...track }) => track);

      const uniqueYears = [
        ...new Set(
          allTracksDates.map((t) => t.date?.substring(0, 4)).filter(Boolean),
        ),
      ]
        .sort()
        .reverse();

      return {
        data,
        total: sorted.length,
        meta: {
          genres: allGenres.map((g) => g.name),
          years: uniqueYears,
        },
      };
    }

    if (order === 'random') {
      const [tracks, allGenres, allTracksDates] = await Promise.all([
        this.prisma.track.findMany({
          where,
          include,
        }),
        this.prisma.genre.findMany({ select: { name: true } }),
        this.prisma.track.findMany({
          select: { date: true },
          distinct: ['date'],
          where: { date: { not: null } },
        }),
      ]);

      const seed = randomSeed || 'tracks-random-default-seed';
      const sortedBySeed = tracks
        .filter((track) =>
          matchesNormalizedSearch(
            [track.title, ...track.artists.map((artist) => artist.name)],
            normalizedSearch,
          ),
        )
        .map((track) => ({
          track,
          key: createHash('sha256').update(`${seed}:${track.id}`).digest('hex'),
        }))
        .sort(
          (a, b) =>
            a.key.localeCompare(b.key) || a.track.id.localeCompare(b.track.id),
        )
        .map((entry) => entry.track);

      const data = sortedBySeed
        .slice(skip, skip + Number(limit))
        .map(({ playStats, ...rest }) => ({
          ...rest,
          plays: playStats?.[0]?.plays ?? 0,
        }));

      const uniqueYears = [
        ...new Set(
          allTracksDates.map((t) => t.date?.substring(0, 4)).filter(Boolean),
        ),
      ]
        .sort()
        .reverse();

      return {
        data,
        total: sortedBySeed.length,
        meta: {
          genres: allGenres.map((g) => g.name),
          years: uniqueYears,
        },
      };
    }

    if (normalizedSearch) {
      const [matchingTracks, allGenres, allTracksDates] = await Promise.all([
        this.prisma.track.findMany({
          where,
          orderBy,
          include,
        }),
        this.prisma.genre.findMany({ select: { name: true } }),
        this.prisma.track.findMany({
          select: { date: true },
          distinct: ['date'],
          where: { date: { not: null } },
        }),
      ]);

      const filteredTracks = matchingTracks.filter((track) =>
        matchesNormalizedSearch(
          [track.title, ...track.artists.map((artist) => artist.name)],
          normalizedSearch,
        ),
      );

      const data = filteredTracks
        .slice(skip, skip + Number(limit))
        .map(({ playStats, ...rest }) => ({
          ...rest,
          plays: playStats?.[0]?.plays ?? 0,
        }));

      const uniqueYears = [
        ...new Set(
          allTracksDates.map((t) => t.date?.substring(0, 4)).filter(Boolean),
        ),
      ]
        .sort()
        .reverse();

      return {
        data,
        total: filteredTracks.length,
        meta: {
          genres: allGenres.map((g) => g.name),
          years: uniqueYears,
        },
      };
    }

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

    const allGenres = await this.prisma.genre.findMany({
      select: { name: true },
    });
    const allTracksDates = await this.prisma.track.findMany({
      select: { date: true },
      distinct: ['date'],
      where: { date: { not: null } },
    });

    const uniqueYears = [
      ...new Set(
        allTracksDates.map((t) => t.date?.substring(0, 4)).filter(Boolean),
      ),
    ]
      .sort()
      .reverse();

    return {
      data,
      total,
      meta: {
        genres: allGenres.map((g) => g.name),
        years: uniqueYears,
      },
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
