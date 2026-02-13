import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as crypto from 'crypto';
import { ScannerGateway, type ScanProgressPayload } from './scanner.gateway';

@Injectable()
export class ScannerService implements OnModuleInit {
  private readonly logger = new Logger(ScannerService.name);
  private musicPath = process.env.MUSIC_PATH ?? '/music';
  private coversCachePath: string;
  private isScanning = false;

  constructor(
    private prisma: PrismaService,
    private scannerGateway: ScannerGateway,
    private configService: ConfigService,
  ) {
    this.coversCachePath = this.configService.get<string>('COVERS_CACHE_PATH', '/data/covers');
  }

  async onModuleInit() {
    if (!this.musicPath || !fs.existsSync(this.musicPath)) {
      this.logger.error(`Music path not found: ${this.musicPath}`);
      return;
    }

    if (!fs.existsSync(this.coversCachePath)) {
      fs.mkdirSync(this.coversCachePath, { recursive: true });
    }

    // void this.scanLibrary().catch((e: Error) => {
    //   this.logger.error(`Initial scan failed: ${e.message}`);
    // });
    this.logger.log('Automatic startup scan is disabled.');
  }

  private saveCover(picture: any): string | null {
    if (!picture) return null;

    const hash = crypto.createHash('md5').update(picture.data).digest('hex');
    
    const ext = picture.format === 'image/png' ? 'png' : 'jpg';
    const filename = `${hash}.${ext}`;
    const savePath = path.join(this.coversCachePath, filename);

    if (!fs.existsSync(savePath)) {
      fs.writeFileSync(savePath, picture.data);
    }

    return filename;
  }

  private buildMetadataChecksum(metadata: {
    title: string | null;
    trackNumber: number | null;
    totalNumber: number | null;
    discNumber: number | null;
    duration: number;
    bitrate: number;
    format: string;
    date: string | null;
    coverFilename: string | null;
    trackArtists: string[];
    albumArtists: string[];
    nativeTrackArtistTags: string[];
    nativeAlbumArtistTags: string[];
    genres: string[];
    albumTitle: string;
    replayGainTrack: number | null;
    replayGainAlbum: number | null;
    replayPeakTrack: number | null;
    replayPeakAlbum: number | null;
  }) {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(metadata))
      .digest('hex');
  }

  private extractYear(value: string | number | null): string | null {
    if (value === null || value === undefined) return null;

    const raw = String(value).trim();
    const match = raw.match(/\b(\d{4})\b/);
    return match ? match[1] : null;
  }

  private async ensureArtists(names: string[]) {
    const records = await Promise.all(
      names.map(name =>
        this.prisma.artist.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    return records.map(a => ({ id: a.id }));
  }

  private async ensureGenres(names: string[]) {
    const records = await Promise.all(
      names.map(name =>
        this.prisma.genre.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    return records.map(g => ({ id: g.id }));
  }

  private normalizeArtists(value?: string | string[] | null): string[] {
    if (!value) return [];

    const raw = Array.isArray(value) ? value : [value];
    const normalized = raw
      .flatMap((entry) => entry.split('\u0000'))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return Array.from(new Set(normalized));
  }

  private getNativeTagValues(metadata: any, tagIds: string[]): string[] {
    if (!metadata?.native) return [];

    const ids = new Set(tagIds.map((id) => id.toLowerCase()));
    const values: string[] = [];

    Object.values(metadata.native).forEach((tags: any) => {
      tags.forEach((tag: any) => {
        if (!tag?.id) return;
        if (!ids.has(String(tag.id).toLowerCase())) return;

        const rawValues = Array.isArray(tag.value) ? tag.value : [tag.value];
        rawValues.forEach((value) => {
          if (value === null || value === undefined) return;
          values.push(String(value));
        });
      });
    });

    return values;
  }

  private parseNumericTagValue(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const normalized = String(value).replace(',', '.');
    const match = normalized.match(/-?\d+(\.\d+)?/);
    if (!match) return null;

    const parsed = Number.parseFloat(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getReplayGainValue(metadata: any, commonValue: unknown, nativeTagIds: string[]): number | null {
    const fromCommon = this.parseNumericTagValue(commonValue as string | number | null | undefined);
    if (fromCommon !== null) return fromCommon;

    const nativeValues = this.getNativeTagValues(metadata, nativeTagIds);
    for (const nativeValue of nativeValues) {
      const parsed = this.parseNumericTagValue(nativeValue);
      if (parsed !== null) return parsed;
    }

    return null;
  }

  private async pruneUnusedCovers() {
    if (!fs.existsSync(this.coversCachePath)) return;

    const trackCovers = await this.prisma.track.findMany({ select: { coverPath: true } });

    const usedCovers = new Set(
      trackCovers
        .map(c => c.coverPath)
        .filter((c): c is string => Boolean(c))
    );

    const files = fs.readdirSync(this.coversCachePath);
    let removed = 0;

    for (const file of files) {
      if (!usedCovers.has(file)) {
        try {
          fs.unlinkSync(path.join(this.coversCachePath, file));
          removed += 1;
        } catch (e) {
          this.logger.warn(`Failed to remove cover ${file}: ${e.message}`);
        }
      }
    }

    if (removed > 0) {
      this.logger.log(`Removed ${removed} unused covers.`);
    }
  }

  private emitProgress(progress: ScanProgressPayload) {
    this.scannerGateway.emitProgress(progress);
  }

  async scanLibrary() {
    if (this.isScanning) {
      this.logger.warn('Scan request skipped because another scan is running.');
      return false;
    }

    this.isScanning = true;
    const startedAt = new Date().toISOString();

    try {
      this.logger.log(`Scanning: ${this.musicPath}`);

      const files = await glob('**/*.{mp3,flac,m4a,wav,ogg,opus}', {
        cwd: this.musicPath,
        absolute: true,
      });

      const folderSet = new Set(files.map((filePath) => path.dirname(filePath)));
      const totalFolders = folderSet.size;

      this.emitProgress({
        status: 'running',
        foldersScanned: 0,
        totalFolders,
        startedAt,
      });

      this.logger.log(`Found ${files.length} files in ${totalFolders} folders.`);
      const mm = await import('music-metadata');

      const scannedPaths = new Set<string>();
      const scannedFolders = new Set<string>();

      for (const filePath of files) {
        scannedPaths.add(filePath);

        const folderPath = path.dirname(filePath);
        if (!scannedFolders.has(folderPath)) {
          scannedFolders.add(folderPath);
          this.emitProgress({
            status: 'running',
            foldersScanned: scannedFolders.size,
            totalFolders,
            startedAt,
          });
        }

        try {
          const metadata = await mm.parseFile(filePath);
          const { common, format } = metadata;

          const c = common as any;

          const nativeTrackArtists = this.getNativeTagValues(metadata, ['ARTIST', 'ARTISTS']);
          let trackArtists = this.normalizeArtists(common.artists ?? common.artist ?? nativeTrackArtists);
          if (trackArtists.length === 0) {
            trackArtists = ['Unknown Artist'];
          }

          const nativeAlbumArtists = this.getNativeTagValues(metadata, [
            'ALBUMARTIST',
            'ALBUM ARTIST',
            'ALBUMARTISTS',
            'ALBUM ARTISTS',
          ]);
          const albumArtistsFromCommon = this.normalizeArtists(c.albumartists ?? common.albumartist);
          const albumArtistsFromNative = this.normalizeArtists(nativeAlbumArtists);
          const albumArtists =
            albumArtistsFromNative.length > 0
              ? albumArtistsFromNative
              : albumArtistsFromCommon.length > 0
              ? albumArtistsFromCommon
              : trackArtists;

          const genres = common.genre || [];
          const albumTitle = common.album || 'Unknown Album';

          let releaseDate: string | null = null;
          if (common.date) releaseDate = common.date;
          else if (common.year) releaseDate = common.year.toString() + '-01-01';

          const albumYear = this.extractYear(common.date ?? common.year ?? releaseDate);
          const albumDate = albumYear ?? releaseDate;

          const coverFilename = this.saveCover(common.picture?.[0]);
          const replayGainTrack = this.getReplayGainValue(metadata, c.replaygain_track_gain, [
            'REPLAYGAIN_TRACK_GAIN',
          ]);
          const replayGainAlbum = this.getReplayGainValue(metadata, c.replaygain_album_gain, [
            'REPLAYGAIN_ALBUM_GAIN',
          ]);
          const replayPeakTrack = this.getReplayGainValue(metadata, c.replaygain_track_peak, [
            'REPLAYGAIN_TRACK_PEAK',
          ]);
          const replayPeakAlbum = this.getReplayGainValue(metadata, c.replaygain_album_peak, [
            'REPLAYGAIN_ALBUM_PEAK',
          ]);

          const metadataChecksum = this.buildMetadataChecksum({
            title: common.title || null,
            trackNumber: common.track.no || null,
            totalNumber: common.track.of || null,
            discNumber: common.disk.no || null,
            duration: format.duration || 0,
            bitrate: format.bitrate || 0,
            format: format.container || 'unknown',
            date: releaseDate,
            coverFilename,
            trackArtists,
            albumArtists,
            nativeTrackArtistTags: this.normalizeArtists(nativeTrackArtists),
            nativeAlbumArtistTags: this.normalizeArtists(nativeAlbumArtists),
            genres,
            albumTitle,
            replayGainTrack,
            replayGainAlbum,
            replayPeakTrack,
            replayPeakAlbum,
          });

          const exists = await this.prisma.track.findUnique({ where: { filePath } });
          if (exists && exists.metadataChecksum === metadataChecksum) {
            continue;
          }

          let album = await this.prisma.album.findFirst({
            where: {
              title: albumTitle,
              ...(albumYear
                ? {
                    date: albumYear,
                  }
                : { date: null }),
            },
          });

          if (!album) {
            album = await this.prisma.album.create({
              data: {
                title: albumTitle,
                date: albumDate,
                artists: {
                  connectOrCreate: albumArtists.map((name) => ({
                    where: { name },
                    create: { name },
                  })),
                },
              },
            });
          } else if (albumArtists.length > 0) {
            await this.prisma.album.update({
              where: { id: album.id },
              data: {
                artists: {
                  connectOrCreate: albumArtists.map((name) => ({
                    where: { name },
                    create: { name },
                  })),
                },
              },
            });
          }

          const artistConnections = await this.ensureArtists(trackArtists);
          const genreConnections = await this.ensureGenres(genres);

          if (exists) {
            await this.prisma.track.update({
              where: { id: exists.id },
              data: {
                title: common.title || path.basename(filePath),
                number: common.track.no || null,
                totalNumber: common.track.of || null,
                discNumber: common.disk.no || 1,
                duration: format.duration || 0,
                bitrate: format.bitrate || 0,
                size: fs.statSync(filePath).size,
                filePath,
                fileName: path.basename(filePath),
                coverPath: coverFilename,
                format: format.container || 'unknown',
                date: releaseDate,
                replayGainTrack,
                replayGainAlbum,
                replayPeakTrack,
                replayPeakAlbum,
                metadataChecksum,
                album: { connect: { id: album.id } },
                genres: {
                  set: genreConnections,
                },
                artists: {
                  set: artistConnections,
                },
              },
            });
          } else {
            await this.prisma.track.create({
              data: {
                title: common.title || path.basename(filePath),
                number: common.track.no || null,
                totalNumber: common.track.of || null,
                discNumber: common.disk.no || 1,
                duration: format.duration || 0,
                bitrate: format.bitrate || 0,
                size: fs.statSync(filePath).size,
                filePath,
                fileName: path.basename(filePath),
                coverPath: coverFilename,
                format: format.container || 'unknown',
                date: releaseDate,
                replayGainTrack,
                replayGainAlbum,
                replayPeakTrack,
                replayPeakAlbum,
                metadataChecksum,
                album: { connect: { id: album.id } },
                genres: {
                  connect: genreConnections,
                },
                artists: {
                  connect: artistConnections,
                },
              },
            });
          }
        } catch (e) {
          this.logger.error(`Error processing ${filePath}: ${e.message}`);
        }
      }

      const existingTracks = await this.prisma.track.findMany({
        select: { id: true, filePath: true },
      });

      const missingIds = existingTracks
        .filter((track) => !scannedPaths.has(track.filePath))
        .map((track) => track.id);

      if (missingIds.length > 0) {
        await this.prisma.$transaction(async (tx) => {
          for (const id of missingIds) {
            await tx.track.update({
              where: { id },
              data: {
                playlists: { set: [] },
                artists: { set: [] },
                genres: { set: [] },
              },
            });
          }

          await tx.track.deleteMany({
            where: { id: { in: missingIds } },
          });

          await tx.artist.deleteMany({
            where: { tracks: { none: {} } },
          });

          await tx.album.deleteMany({
            where: { tracks: { none: {} } },
          });

          await tx.genre.deleteMany({
            where: { tracks: { none: {} } },
          });
        });

        this.logger.log(`Removed ${missingIds.length} missing tracks.`);
      }

      await this.pruneUnusedCovers();
      this.logger.log('Scan complete!');

      this.emitProgress({
        status: 'completed',
        foldersScanned: totalFolders,
        totalFolders,
        startedAt,
        finishedAt: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      const message = e.message;
      this.logger.error(`Scan failed: ${message}`);

      this.emitProgress({
        status: 'failed',
        foldersScanned: 0,
        totalFolders: 0,
        startedAt,
        finishedAt: new Date().toISOString(),
        message,
      });

      throw e;
    } finally {
      this.isScanning = false;
    }
  }
}
