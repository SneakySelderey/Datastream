import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

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

  async scanLibrary() {
    this.logger.log(`Scanning: ${this.musicPath}`);

    const files = await glob('**/*.{mp3,flac,m4a,wav,ogg,opus}', { 
      cwd: this.musicPath, 
      absolute: true 
    });
    
    this.logger.log(`Found ${files.length} files.`);
    const mm = await import('music-metadata');

    for (const filePath of files) {
      try {
        const exists = await this.prisma.track.findUnique({ where: { filePath } });
        if (exists) continue;

        const metadata = await mm.parseFile(filePath);
        const { common, format } = metadata;

        const c = common as any; 

        const trackArtists: string[] = common.artists || (common.artist ? [common.artist] : ['Unknown Artist']);
        const albumArtists: string[] = c.albumartists || (common.albumartist ? [common.albumartist] : null) || trackArtists;
        
        const genres = common.genre || [];
        const albumTitle = common.album || 'Unknown Album';
        
        let releaseDate: Date | null = null;
        if (common.date) releaseDate = new Date(common.date);
        else if (common.year) releaseDate = new Date(common.year, 0, 1);

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

        if (!album.coverPath && common.picture?.length) {
          const picture = common.picture[0];
          const ext = picture.format === 'image/png' ? 'png' : 'jpg';
          const coverFilename = `${album.id}.${ext}`;
          const savePath = path.join(this.coversCachePath, coverFilename);

          fs.writeFileSync(savePath, picture.data);

          album = await this.prisma.album.update({
            where: { id: album.id },
            data: { coverPath: coverFilename },
          });
        }

        await this.prisma.track.create({
          data: {
            title: common.title || path.basename(filePath),
            number: common.track.no || null,
            totalNumber: common.track.of || null,
            discNumber: common.disk.no || 1,
            duration: format.duration || 0,
            bitrate: format.bitrate || null,
            size: fs.statSync(filePath).size,
            filePath: filePath,
            fileName: path.basename(filePath),
            format: format.container || 'unknown',
            date: releaseDate,
            
            album: { connect: { id: album.id } },
            
            genres: {
              connectOrCreate: genres.map((g) => ({
                where: { name: g },
                create: { name: g },
              })),
            },
            
            artists: {
              connectOrCreate: trackArtists.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
        });

      } catch (e) {
        this.logger.error(`Error processing ${filePath}: ${e.message}`);
      }
    }
    this.logger.log('Scan complete!');
  }
}