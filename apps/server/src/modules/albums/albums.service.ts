import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.album.findMany({
      include: {
        artists: true,
      },
      orderBy: { title: 'asc' },
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

    return { ...album, tracks };
  }
}
