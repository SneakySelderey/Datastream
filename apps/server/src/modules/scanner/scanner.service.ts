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

  private buildArtistIdentityHash(name: string): string {
    return this.buildIdentityHash(['artist', name]);
  }

  private async ensureArtists(names: string[]) {
    const records = await Promise.all(
      names.map(async (name) => {
        const identityHash = this.buildArtistIdentityHash(name);

        const existingByIdentity = await this.prisma.artist.findUnique({
          where: { identityHash },
        });

        if (existingByIdentity) {
          if (existingByIdentity.name !== name) {
            return this.prisma.artist.update({
              where: { id: existingByIdentity.id },
              data: {
                name,
                identityHash,
              },
            });
          }

          return existingByIdentity;
        }

        const existingByName = await this.prisma.artist.findUnique({
          where: { name },
        });

        if (existingByName) {
          return this.prisma.artist.update({
            where: { id: existingByName.id },
            data: {
              identityHash,
            },
          });
        }

        return this.prisma.artist.create({
          data: {
            name,
            identityHash,
          },
        });
      })
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

  private normalizeArtistSet(names: string[]): string[] {
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }

  private normalizeIdentityPart(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private buildIdentityHash(parts: Array<string | number | null | undefined>): string {
    const normalized = parts.map((part) => this.normalizeIdentityPart(part)).join('|');
    return crypto.createHash('sha1').update(normalized).digest('hex');
  }

  private buildAlbumIdentityHash(input: {
    albumTitle: string;
    albumArtists: string[];
    albumDate: string | null;
  }): string {
    return this.buildIdentityHash([
      'album',
      ...this.normalizeArtistSet(input.albumArtists),
      input.albumTitle,
      input.albumDate,
    ]);
  }

  private async findAlbumByIdentity(identityHash: string) {
    return this.prisma.album.findUnique({
      where: { identityHash },
      select: {
        id: true,
        date: true,
      },
    });
  }

  private buildTrackIdentityHash(input: {
    albumIdentityHash: string;
    title: string;
    discNumber: number | null | undefined;
    trackNumber: number | null | undefined;
  }): string {
    return this.buildIdentityHash([
      'track',
      input.albumIdentityHash,
      input.discNumber ?? 1,
      input.trackNumber ?? '',
      input.title,
    ]);
  }

  private hasSameArtists(left: string[], right: string[]): boolean {
    const normalizedLeft = this.normalizeArtistSet(left);
    const normalizedRight = this.normalizeArtistSet(right);

    if (normalizedLeft.length !== normalizedRight.length) {
      return false;
    }

    return normalizedLeft.every((name, index) => name === normalizedRight[index]);
  }

  private async findAlbumByTitleAndArtists(title: string, artistNames: string[]) {
    const albums = await this.prisma.album.findMany({
      where: { title },
      select: {
        id: true,
        date: true,
        identityHash: true,
        artists: {
          select: {
            name: true,
          },
        },
      },
    });

    const matchingAlbum =
      albums.find((album) =>
        this.hasSameArtists(
          album.artists.map((artist) => artist.name),
          artistNames,
        ),
      ) ?? null;

    if (!matchingAlbum) {
      return null;
    }

    return {
      id: matchingAlbum.id,
      date: matchingAlbum.date,
      identityHash: matchingAlbum.identityHash,
    };
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

  private async yieldToEventLoop() {
    await new Promise<void>((resolve) => setImmediate(resolve));
  }

  private async emitDirectoryProgress(completedDirectories: number, totalDirectories: number, startedAt: string) {
    this.emitProgress({
      status: 'running',
      foldersScanned: completedDirectories,
      totalFolders: totalDirectories,
      startedAt,
    });

    await this.yieldToEventLoop();
  }

  private async emitFinalizingProgress(totalDirectories: number, startedAt: string) {
    this.emitProgress({
      status: 'finalizing',
      foldersScanned: totalDirectories,
      totalFolders: totalDirectories,
      startedAt,
    });
    await this.yieldToEventLoop();
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

  private async pruneOrphanedLibraryEntities() {
    await this.prisma.$transaction(async (tx) => {
      await tx.album.deleteMany({
        where: { tracks: { none: {} } },
      });

      await tx.artist.deleteMany({
        where: {
          tracks: { none: {} },
          albums: { none: {} },
        },
      });

      await tx.genre.deleteMany({
        where: { tracks: { none: {} } },
      });
    });
  }

  private buildDirectoryChecksum(filesInDirectory: string[]): string {
    const hash = crypto.createHash('md5');

    const sortedFiles = [...filesInDirectory].sort();
    for (const filePath of sortedFiles) {
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(this.musicPath, filePath);
      hash.update(relativePath);
      hash.update('|');
      hash.update(String(stats.mtime.getTime()));
      hash.update('\n');
    }

    return hash.digest('hex');
  }

  private buildFileFingerprintChecksum(stats: fs.Stats): string {
    return String(stats.mtime.getTime());
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
        this.logger.log('Running full rescan: rescanning all folders while preserving track identities.');
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

      const previousDirectoryChecksums = options.fullRescan ? {} : await this.loadDirectoryChecksums();
      const changedDirectoryChecksums: Record<string, string> = {};
      const totalDirectories = filesByDirectory.size;
      let changedDirectoriesCount = 0;
      let completedDirectories = 0;

      await this.emitDirectoryProgress(0, totalDirectories, startedAt);

      let mm: typeof import('music-metadata') | null = null;
      const failedDirectories = new Set<string>();

      for (const [directoryPath, directoryFiles] of filesByDirectory) {
        const checksum = this.buildDirectoryChecksum(directoryFiles);

        const hasDirectoryChanged = previousDirectoryChecksums[directoryPath] !== checksum;
        if (hasDirectoryChanged) {
          changedDirectoriesCount += 1;
          mm ??= await import('music-metadata');

          for (const filePath of directoryFiles) {
            try {
              const fileStats = fs.statSync(filePath);
              const fileMtimeChecksum = this.buildFileFingerprintChecksum(fileStats);

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
              const albumIdentityHash = this.buildAlbumIdentityHash({
                albumTitle,
                albumArtists,
                albumDate,
              });
              const trackTitle = common.title || path.basename(filePath);
              const identityHash = this.buildTrackIdentityHash({
                albumIdentityHash,
                title: trackTitle,
                discNumber: common.disk.no,
                trackNumber: common.track.no,
              });

              const [existingTrackByIdentity, existingTrackByPath] = await Promise.all([
                this.prisma.track.findUnique({
                  where: { identityHash },
                  select: {
                    id: true,
                    filePath: true,
                    metadataChecksum: true,
                  },
                }),
                this.prisma.track.findUnique({
                  where: { filePath },
                  select: {
                    id: true,
                    filePath: true,
                    metadataChecksum: true,
                  },
                }),
              ]);

              const existingTrack = existingTrackByIdentity ?? existingTrackByPath;

              if (
                existingTrackByIdentity &&
                existingTrackByPath &&
                existingTrackByIdentity.id !== existingTrackByPath.id
              ) {
                this.logger.warn(
                  `Track identity collision detected for ${filePath}; reusing ${existingTrackByIdentity.id} and ignoring duplicate path row ${existingTrackByPath.id}.`,
                );
              }

              if (existingTrack && existingTrack.metadataChecksum === fileMtimeChecksum) {
                if (!existingTrackByIdentity || existingTrack.filePath !== filePath) {
                  await this.prisma.track.update({
                    where: { id: existingTrack.id },
                    data: {
                      identityHash,
                      filePath,
                      fileName: path.basename(filePath),
                    },
                  });
                }

                continue;
              }

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
              const albumArtistConnections = await this.ensureArtists(albumArtists);
              let album = await this.findAlbumByIdentity(albumIdentityHash);

              if (!album) {
                album = await this.findAlbumByTitleAndArtists(albumTitle, albumArtists);
              }

              if (!album) {
                album = await this.prisma.album.create({
                  select: {
                    id: true,
                    date: true,
                  },
                  data: {
                    identityHash: albumIdentityHash,
                    title: albumTitle,
                    date: albumDate,
                    artists: {
                      connect: albumArtistConnections,
                    },
                  },
                });
              } else if (albumArtists.length > 0) {
                await this.prisma.album.update({
                  where: { id: album.id },
                  data: {
                    identityHash: albumIdentityHash,
                    title: albumTitle,
                    date: album.date ?? albumDate,
                    artists: {
                      set: albumArtistConnections,
                    },
                  },
                });
              }

              if (!album) {
                continue;
              }

              const artistConnections = await this.ensureArtists(trackArtists);
              const genreConnections = await this.ensureGenres(genres);

              if (existingTrack) {
                await this.prisma.track.update({
                  where: { id: existingTrack.id },
                  data: {
                    title: common.title || path.basename(filePath),
                    identityHash,
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
                    identityHash,
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

        if (hasDirectoryChanged && !failedDirectories.has(directoryPath)) {
          changedDirectoryChecksums[directoryPath] = checksum;
        }

        completedDirectories += 1;
        await this.emitDirectoryProgress(completedDirectories, totalDirectories, startedAt);
      }

      const removedDirectories = Object.keys(previousDirectoryChecksums).filter(
        (directoryPath) => !filesByDirectory.has(directoryPath),
      );

      await this.removeDirectoryChecksums(removedDirectories);
      this.logger.log(
        `Found ${files.length} files in ${filesByDirectory.size} directories. ${changedDirectoriesCount} changed/new directories, ${removedDirectories.length} removed directories.`,
      );

      await this.emitFinalizingProgress(totalDirectories, startedAt);

      const hasLibraryChanges =
        changedDirectoriesCount > 0 || removedDirectories.length > 0 || options.fullRescan;
      let missingIds: string[] = [];

      if (hasLibraryChanges) {
        const existingTracks = await this.prisma.track.findMany({
          select: { id: true, filePath: true },
        });

        missingIds = existingTracks
          .filter((track) => !scannedPaths.has(track.filePath))
          .map((track) => track.id);
      }

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
        });

        this.logger.log(`Removed ${missingIds.length} missing tracks.`);
      }

      if (hasLibraryChanges || missingIds.length > 0) {
        await this.pruneOrphanedLibraryEntities();
      }

      for (const directoryPath of failedDirectories) {
        delete changedDirectoryChecksums[directoryPath];
      }

      await this.saveDirectoryChecksums(changedDirectoryChecksums);

      if (hasLibraryChanges || missingIds.length > 0) {
        await this.pruneUnusedCovers();
      }
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
