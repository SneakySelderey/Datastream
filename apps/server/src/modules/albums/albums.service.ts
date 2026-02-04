import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const albums = await this.prisma.album.findMany({
      include: {
        artists: true,
        tracks: {
          select: { coverPath: true },
          orderBy: { number: 'asc' },
          take: 1,
        },
      },
      orderBy: { title: 'asc' },
    });

    return albums.map(album => {
      const coverPath = album.tracks[0]?.coverPath ?? null;
      return { ...album, coverPath };
    });
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
