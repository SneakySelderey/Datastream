import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as crypto from 'crypto';

@Injectable()
export class ScannerService implements OnModuleInit {
  private readonly logger = new Logger(ScannerService.name);
  private musicPath = process.env.MUSIC_PATH;
  private coversCachePath = path.join(process.cwd(), 'covers');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (!this.musicPath || !fs.existsSync(this.musicPath)) {
      this.logger.error(`Music path not found: ${this.musicPath}`);
      return;
    }

    if (!fs.existsSync(this.coversCachePath)) {
      fs.mkdirSync(this.coversCachePath, { recursive: true });
    }

    await this.scanLibrary();
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
    genres: string[];
    albumTitle: string;
  }) {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(metadata))
      .digest('hex');
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

  async scanLibrary() {
    this.logger.log(`Scanning: ${this.musicPath}`);

    const files = await glob('**/*.{mp3,flac,m4a,wav,ogg,opus}', { 
      cwd: this.musicPath, 
      absolute: true 
    });
    
    this.logger.log(`Found ${files.length} files.`);
    const mm = await import('music-metadata');

    const scannedPaths = new Set<string>();

    for (const filePath of files) {
      scannedPaths.add(filePath);
      
      try {
        const metadata = await mm.parseFile(filePath);
        const { common, format } = metadata;

        const c = common as any; 

        const trackArtists: string[] = common.artists || (common.artist ? [common.artist] : ['Unknown Artist']);
        const albumArtists: string[] = c.albumartists || (common.albumartist ? [common.albumartist] : null) || trackArtists;
        
        const genres = common.genre || [];
        const albumTitle = common.album || 'Unknown Album';
        
        let releaseDate: string | null = null;
        if (common.date) releaseDate = common.date;
        else if (common.year) releaseDate = common.year.toString() + '-01-01';

        const coverFilename = this.saveCover(common.picture?.[0]);

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
          genres,
          albumTitle,
        });

        const exists = await this.prisma.track.findUnique({ where: { filePath } });
        if (exists && exists.metadataChecksum === metadataChecksum) {
          continue;
        }

        let album = await this.prisma.album.findFirst({
          where: {
            title: albumTitle,
            artists: { 
              some: { name: { in: albumArtists } } 
            }
          }
        });

        if (!album) {
          album = await this.prisma.album.create({
            data: {
              title: albumTitle,
              date: releaseDate,
              artists: {
                connectOrCreate: albumArtists.map(name => ({
                    where: { name },
                    create: { name }
                }))
              }
            }
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
              filePath: filePath,
              fileName: path.basename(filePath),
              coverPath: coverFilename,
              format: format.container || 'unknown',
              date: releaseDate,
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
              filePath: filePath,
              fileName: path.basename(filePath),
              coverPath: coverFilename,
              format: format.container || 'unknown',
              date: releaseDate,
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
      .filter(track => !scannedPaths.has(track.filePath))
      .map(track => track.id);

    if (missingIds.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        await tx.trackPlay.deleteMany({
          where: { trackId: { in: missingIds } },
        });

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
  }
}