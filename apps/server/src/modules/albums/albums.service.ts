import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';
import {
  matchesNormalizedSearch,
  normalizeSearchQuery,
} from '../../common/search-normalization';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  private readonly relationChunkSize = 200;

  private chunkItems<T>(items: T[], size: number): T[][];
  private chunkItems<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks;
  }

  private async getAlbumsMeta() {
    const [allGenres, allAlbumsDates] = await Promise.all([
      this.prisma.genre.findMany({ select: { name: true } }),
      this.prisma.album.findMany({
        select: { date: true },
        distinct: ['date'],
        where: { date: { not: null } },
      }),
    ]);

    const uniqueYears = [
      ...new Set(
        allAlbumsDates
          .map((album) => album.date?.substring(0, 4))
          .filter(Boolean),
      ),
    ]
      .sort()
      .reverse();

    return {
      genres: allGenres.map((genreRecord) => genreRecord.name),
      years: uniqueYears,
    };
  }

  private async getSearchableAlbums(
    where: any,
    orderBy?: any,
  ): Promise<
    Array<{ id: string; title: string; artists: Array<{ name: string }> }>
  > {
    const albums = await this.prisma.album.findMany({
      where,
      select: {
        id: true,
        title: true,
      },
      orderBy,
    });
    const artistNamesByAlbumId = new Map<string, string[]>();
    const albumIdChunks = this.chunkItems(
      albums.map((album) => album.id),
      this.relationChunkSize,
    );

    for (const albumIdChunk of albumIdChunks) {
      const albumsWithArtists = await this.prisma.album.findMany({
        where: { id: { in: albumIdChunk } },
        select: {
          id: true,
          artists: { select: { name: true } },
        },
      });

      for (const album of albumsWithArtists) {
        artistNamesByAlbumId.set(
          album.id,
          album.artists.map((artist) => artist.name),
        );
      }
    }

    return albums.map((album) => ({
      ...album,
      artists: (artistNamesByAlbumId.get(album.id) ?? []).map((name) => ({
        name,
      })),
    }));
  }

  private async getAlbumsPage(
    albumIds: string[],
    orderBy: any = { title: 'asc' },
  ) {
    if (albumIds.length === 0) {
      return [];
    }

    const albums = await this.prisma.album.findMany({
      where: { id: { in: albumIds } },
      include: {
        artists: true,
        tracks: {
          select: { coverPath: true },
          orderBy: { number: 'asc' },
          take: 1,
        },
      },
      orderBy,
    });

    const positionById = new Map(albumIds.map((id, index) => [id, index]));

    return albums
      .map((album) => ({
        ...album,
        coverPath: album.tracks[0]?.coverPath ?? null,
      }))
      .sort(
        (left, right) =>
          (positionById.get(left.id) ?? 0) - (positionById.get(right.id) ?? 0),
      );
  }

  private async getAlbumTrackStats(albumIds: string[], userId: string) {
    const tracks: Array<{
      albumId: string | null;
      playStats: Array<{
        plays: number;
        updatedAt: Date;
      }>;
    }> = [];
    const albumIdChunks = this.chunkItems(albumIds, 200);

    for (const albumIdChunk of albumIdChunks) {
      const chunkTracks = await this.prisma.track.findMany({
        where: {
          albumId: {
            in: albumIdChunk,
          },
        },
        select: {
          albumId: true,
          playStats: {
            where: { userId },
            select: {
              plays: true,
              updatedAt: true,
            },
          },
        },
      });

      tracks.push(...chunkTracks);
    }

    return tracks;
  }

  async findAll(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    genre?: string,
    year?: string,
    artistId?: string,
    order?: string,
    randomSeed?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    const normalizedSearch = normalizeSearchQuery(search);

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

    if (order === 'recently-added') {
      orderBy = { createdAt: 'desc' };
    }

    if (order === 'most-played') {
      const matchingAlbums = await this.getSearchableAlbums(where);
      const searchedAlbums = matchingAlbums.filter((album) =>
        matchesNormalizedSearch(
          [album.title, ...album.artists.map((artist) => artist.name)],
          normalizedSearch,
        ),
      );
      const trackStats = await this.getAlbumTrackStats(
        searchedAlbums.map((album) => album.id),
        userId,
      );
      const totalPlaysByAlbumId = new Map<string, number>();

      for (const track of trackStats) {
        if (!track.albumId) continue;

        const trackPlays = track.playStats.reduce(
          (sum, playStat) => sum + playStat.plays,
          0,
        );
        totalPlaysByAlbumId.set(
          track.albumId,
          (totalPlaysByAlbumId.get(track.albumId) ?? 0) + trackPlays,
        );
      }

      const sortedIds = [...searchedAlbums]
        .sort((a, b) => {
          const aPlays = totalPlaysByAlbumId.get(a.id) ?? 0;
          const bPlays = totalPlaysByAlbumId.get(b.id) ?? 0;

          if (bPlays !== aPlays) return bPlays - aPlays;
          return a.title.localeCompare(b.title);
        })
        .map((album) => album.id);
      const pagedIds = sortedIds.slice(skip, skip + Number(limit));
      const [pagedAlbums, meta] = await Promise.all([
        this.getAlbumsPage(pagedIds),
        this.getAlbumsMeta(),
      ]);

      return {
        data: pagedAlbums,
        total: sortedIds.length,
        meta,
      };
    }

    if (order === 'recently-played') {
      const matchingAlbums = await this.getSearchableAlbums(where);
      const searchedAlbums = matchingAlbums.filter((album) =>
        matchesNormalizedSearch(
          [album.title, ...album.artists.map((artist) => artist.name)],
          normalizedSearch,
        ),
      );
      const trackStats = await this.getAlbumTrackStats(
        searchedAlbums.map((album) => album.id),
        userId,
      );
      const lastPlayedAtByAlbumId = new Map<string, Date>();

      for (const track of trackStats) {
        if (!track.albumId) continue;

        for (const playStat of track.playStats) {
          const currentLatest = lastPlayedAtByAlbumId.get(track.albumId);
          if (!currentLatest || playStat.updatedAt > currentLatest) {
            lastPlayedAtByAlbumId.set(track.albumId, playStat.updatedAt);
          }
        }
      }

      const sortedIds = [...searchedAlbums]
        .sort((a, b) => {
          const aPlayed = lastPlayedAtByAlbumId.get(a.id)?.getTime() ?? 0;
          const bPlayed = lastPlayedAtByAlbumId.get(b.id)?.getTime() ?? 0;

          if (aPlayed !== bPlayed) return bPlayed - aPlayed;
          return a.title.localeCompare(b.title);
        })
        .map((album) => album.id);
      const pagedIds = sortedIds.slice(skip, skip + Number(limit));
      const [pagedAlbums, meta] = await Promise.all([
        this.getAlbumsPage(pagedIds),
        this.getAlbumsMeta(),
      ]);

      return {
        data: pagedAlbums,
        total: sortedIds.length,
        meta,
      };
    }

    if (order === 'random') {
      const [matchingAlbums, meta] = await Promise.all([
        this.getSearchableAlbums(where),
        this.getAlbumsMeta(),
      ]);

      const seed = randomSeed || 'albums-random-default-seed';
      const sortedIds = matchingAlbums
        .filter((album) =>
          matchesNormalizedSearch(
            [album.title, ...album.artists.map((artist) => artist.name)],
            normalizedSearch,
          ),
        )
        .map((album) => ({
          id: album.id,
          key: createHash('sha256').update(`${seed}:${album.id}`).digest('hex'),
        }))
        .sort((a, b) => a.key.localeCompare(b.key) || a.id.localeCompare(b.id))
        .map((entry) => entry.id);
      const pagedIds = sortedIds.slice(skip, skip + Number(limit));
      const data = await this.getAlbumsPage(pagedIds);

      return {
        data,
        total: sortedIds.length,
        meta,
      };
    }

    if (normalizedSearch) {
      const [matchingAlbums, meta] = await Promise.all([
        this.getSearchableAlbums(where, orderBy),
        this.getAlbumsMeta(),
      ]);

      const filteredAlbums = matchingAlbums.filter((album) =>
        matchesNormalizedSearch(
          [album.title, ...album.artists.map((artist) => artist.name)],
          normalizedSearch,
        ),
      );
      const pagedIds = filteredAlbums
        .slice(skip, skip + Number(limit))
        .map((album) => album.id);
      const data = await this.getAlbumsPage(pagedIds);

      return {
        data,
        total: filteredAlbums.length,
        meta,
      };
    }

    const [albums, total, meta] = await Promise.all([
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
      this.getAlbumsMeta(),
    ]);

    const data = albums.map((album) => {
      const coverPath = album.tracks[0]?.coverPath ?? null;
      return { ...album, coverPath };
    });

    return {
      data,
      total,
      meta,
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

    const coverPath = tracks.find((t) => t.coverPath)?.coverPath ?? null;
    return { ...album, coverPath, tracks };
  }
}
