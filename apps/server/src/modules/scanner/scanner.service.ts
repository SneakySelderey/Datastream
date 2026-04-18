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

    void this.scanLibrary().catch((e: Error) => {
      this.logger.error(`Initial quick scan failed: ${e.message}`);
    });
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
          this.logger.warn(`Failed to remove cover ${file}: ${this.getErrorMessage(e)}`);
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

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async loadDirectoryChecksums(): Promise<Record<string, string>> {
    try {
      const states = await this.prisma.scannerDirectoryState.findMany({
        select: {
          directoryPath: true,
          checksum: true,
        },
      });

      return states.reduce<Record<string, string>>((acc, state) => {
        acc[state.directoryPath] = state.checksum;
        return acc;
      }, {});
    } catch (e) {
      this.logger.warn(`Failed to load directory checksum state from database: ${this.getErrorMessage(e)}`);
      return {};
    }
  }

  private async saveDirectoryChecksums(checksums: Record<string, string>) {
    try {
      const directoryPaths = Object.keys(checksums);

      for (const directoryPath of directoryPaths) {
        await this.prisma.scannerDirectoryState.upsert({
          where: { directoryPath },
          update: {
            checksum: checksums[directoryPath],
          },
          create: {
            directoryPath,
            checksum: checksums[directoryPath],
          },
        });
      }
    } catch (e) {
      this.logger.warn(`Failed to persist directory checksum state to database: ${this.getErrorMessage(e)}`);
    }
  }

  private async removeDirectoryChecksums(directoryPaths: string[]) {
    if (directoryPaths.length === 0) {
      return;
    }

    try {
      await this.prisma.scannerDirectoryState.deleteMany({
        where: {
          directoryPath: {
            in: directoryPaths,
          },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to remove stale directory checksum state from database: ${this.getErrorMessage(e)}`);
    }
  }

  private buildDirectoryChecksum(filesInDirectory: string[]): string {
    const hash = crypto.createHash('md5');

    const sortedFiles = [...filesInDirectory].sort();
    for (const filePath of sortedFiles) {
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(this.musicPath, filePath);
      hash.update(relativePath);
      hash.update('|');
      hash.update(String(stats.size));
      hash.update('|');
      hash.update(String(stats.mtime.getTime()));
      hash.update('\n');
    }

    return hash.digest('hex');
  }

  private buildFileFingerprintChecksum(stats: fs.Stats): string {
    return crypto
      .createHash('md5')
      .update(String(stats.mtime.getTime()))
      .update('|')
      .update(String(stats.size))
      .digest('hex');
  }

  private async resetLibraryData() {
    await this.prisma.$transaction(async (tx) => {
      await tx.trackPlay.deleteMany({});
      await tx.track.deleteMany({});
      await tx.album.deleteMany({});
      await tx.artist.deleteMany({});
      await tx.genre.deleteMany({});
      await tx.scannerDirectoryState.deleteMany({});
    });

    if (!fs.existsSync(this.coversCachePath)) return;

    const entries = fs.readdirSync(this.coversCachePath);
    
    for (const entry of entries) {
      const entryPath = path.join(this.coversCachePath, entry);
      try {
        if (fs.statSync(entryPath).isFile()) {
          fs.unlinkSync(entryPath);
        }
      } catch (e) {
        this.logger.warn(`Failed to clear cached cover ${entry}: ${this.getErrorMessage(e)}`);
      }
    }
  }

  async fullRescanLibrary() {
    return this.scanLibrary({ fullRescan: true });
  }

  async scanLibrary(options: { fullRescan?: boolean } = {}) {
    if (this.isScanning) {
      this.logger.warn('Scan request skipped because another scan is running.');
      return false;
    }

    this.isScanning = true;
    const startedAt = new Date().toISOString();

    try {
      if (options.fullRescan) {
        this.logger.log('Running full rescan: resetting library data before scanning.');
        await this.resetLibraryData();
      }

      this.logger.log(`Scanning: ${this.musicPath}`);

      const files = await glob('**/*.{mp3,flac,m4a,wav,ogg,opus}', {
        cwd: this.musicPath,
        absolute: true,
      });

      const filesByDirectory = new Map<string, string[]>();
      const scannedPaths = new Set<string>();
      
      for (const filePath of files) {
        scannedPaths.add(filePath);
        const directoryPath = path.dirname(filePath);
        const existing = filesByDirectory.get(directoryPath);

        if (existing) {
          existing.push(filePath);
        } else {
          filesByDirectory.set(directoryPath, [filePath]);
        }
      }

      const previousDirectoryChecksums = await this.loadDirectoryChecksums();
      const currentDirectoryChecksums: Record<string, string> = {};
      const changedDirectories: string[] = [];

      for (const [directoryPath, directoryFiles] of filesByDirectory) {
        const checksum = this.buildDirectoryChecksum(directoryFiles);
        currentDirectoryChecksums[directoryPath] = checksum;

        if (previousDirectoryChecksums[directoryPath] !== checksum) {
          changedDirectories.push(directoryPath);
        }
      }

      const removedDirectories = Object.keys(previousDirectoryChecksums).filter(
        (directoryPath) => !filesByDirectory.has(directoryPath),
      );

      await this.removeDirectoryChecksums(removedDirectories);

      const totalDirectories = filesByDirectory.size;

      this.emitProgress({
        status: 'running',
        foldersScanned: 0,
        totalFolders: totalDirectories,
        startedAt,
      });

      this.logger.log(
        `Found ${files.length} files in ${filesByDirectory.size} directories. ${changedDirectories.length} changed/new directories, ${removedDirectories.length} removed directories.`,
      );
      const mm = await import('music-metadata');

      let scannedDirectories = 0;
      const failedDirectories = new Set<string>();

      for (const directoryPath of changedDirectories) {
        scannedDirectories += 1;
        this.emitProgress({
          status: 'running',
          foldersScanned: scannedDirectories,
          totalFolders: totalDirectories,
          startedAt,
        });

        const directoryFiles = filesByDirectory.get(directoryPath) ?? [];

        for (const filePath of directoryFiles) {
          try {
          const fileStats = fs.statSync(filePath);
          const fileMtimeChecksum = this.buildFileFingerprintChecksum(fileStats);
          const existingTrack = await this.prisma.track.findUnique({
            where: { filePath },
            select: {
              id: true,
              metadataChecksum: true,
            },
          });

          if (existingTrack && existingTrack.metadataChecksum === fileMtimeChecksum) {
            continue;
          }

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

          const metadataChecksum = fileMtimeChecksum;

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

          if (existingTrack) {
            await this.prisma.track.update({
              where: { id: existingTrack.id },
              data: {
                title: common.title || path.basename(filePath),
                number: common.track.no || null,
                totalNumber: common.track.of || null,
                discNumber: common.disk.no || 1,
                duration: format.duration || 0,
                bitrate: format.bitrate || 0,
                size: fileStats.size,
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
                size: fileStats.size,
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
            failedDirectories.add(directoryPath);
            this.logger.error(`Error processing ${filePath}: ${this.getErrorMessage(e)}`);
          }
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

      const nextDirectoryChecksums = { ...currentDirectoryChecksums };
      for (const directoryPath of failedDirectories) {
        const previous = previousDirectoryChecksums[directoryPath];
        if (previous) {
          nextDirectoryChecksums[directoryPath] = previous;
        } else {
          delete nextDirectoryChecksums[directoryPath];
        }
      }

      await this.saveDirectoryChecksums(nextDirectoryChecksums);

      await this.pruneUnusedCovers();
      this.logger.log('Scan complete!');

      this.emitProgress({
        status: 'completed',
        foldersScanned: totalDirectories,
        totalFolders: totalDirectories,
        startedAt,
        finishedAt: new Date().toISOString(),
      });
      return true;
    } catch (e) {
      const message = this.getErrorMessage(e);
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
