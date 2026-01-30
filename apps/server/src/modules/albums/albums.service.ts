import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const albums = await this.prisma.album.findMany({
      include: {
        artists: true,
        tracks: true,
      },
      orderBy: { title: 'asc' }
    });

    return albums.map((album) => ({
      id: album.id,
      title: album.title,
      artists: album.artists,
      artistId: album.artists[0]?.id,
      date: album.date,
      cover: album.coverPath
        ? `http://localhost:3000/stream/cover/${album.coverPath}` 
        : null, 
      trackCount: album.tracks.length,
    }));
  }
  
  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
        where: { id },
        include: { artists: true, tracks: { include: { artists: true, genres: true }, orderBy: { number: 'asc' } } }
    });
    
    if (!album) return null;

    const genreMap = new Map();
    album.tracks.forEach((track) => {
      track.genres.forEach((genre) => {
        genreMap.set(genre.id, { id: genre.id, name: genre.name });
      });
    });
    const uniqueGenres = Array.from(genreMap.values());

    return {
        ...album,
        artists: album.artists,
        cover: album.coverPath ? `http://localhost:3000/stream/cover/${album.coverPath}` : null,
        tracks: album.tracks.map(t => ({
            id: t.id,
            title: t.title,
            albumId: album.id,
            album: album.title,
            number: t.number,
            duration: t.duration,
            src: `http://localhost:3000/stream/track/${t.id}`, 
            artists: t.artists,
            size: t.size,
            format: t.format,
            genres: t.genres,
            cover: t.coverPath ? `http://localhost:3000/stream/cover/${t.coverPath}` : null,
        })),
        genres: uniqueGenres,
        trackCount: album.tracks.length,
        size: album.tracks.reduce((acc, t) => acc + t.size, 0).toString(),
        duration: album.tracks.reduce((acc, t) => acc + t.duration, 0).toString()
    }
  }
}