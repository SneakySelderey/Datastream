import { useState, useEffect } from 'react';

import { type Album } from '../types';

const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'Charon',
    artist: '1000 Eyes',
    date: '2025-01-01',
    cover: '/covers/charon.jpg',
    genres: ['Ambient', 'Drum & Bass'],
    tracklist: [],
    trackCount: 0,
    duration: '0',
    size: '0 MB'
  },
  {
    id: '2',
    title: 'Schwanengesang',
    artist: '1000 Eyes',
    date: '2025-01-01',
    cover: '/covers/Schwanengesang.png',
    genres: ['Classical'],
    tracklist: [
      { id: 1, trackNumber: 1, plays: 5, size: '15.75 MB', genres: ['classical'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27)', artist: '1000 Eyes', src: '/music/01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27).flac', cover: '/covers/Schwanengesang.png', duration: '03:13', quality: 'FLAC' },
      { id: 2, trackNumber: 2, plays: 2, size: '25.15 MB', genres: ['classical'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw)', artist: '1000 Eyes', src: '/music/02 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw).flac', cover: '/covers/Schwanengesang.png', duration: '02:33', quality: 'FLAC' }
    ],
    trackCount: 0,
    duration: '0',
    size: '0 MB'
  },
];

export const useAlbum = (albumId: string) => {
  const [album, setAlbum] = useState<Album>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = () => {
      try {
        setAlbum(mockAlbums.filter((obj) => obj.id == albumId)[0]);

      } catch (e) {
        setError('Cannot load album.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, []);

  return { album, isLoading, error };
};