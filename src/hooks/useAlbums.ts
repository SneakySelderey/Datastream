import { useState, useEffect } from 'react';

import { type Album } from '../types';

const mockAlbums: Album[] = [
  {
    id: 1,
    title: 'Charon',
    artist: '1000 Eyes',
    year: 2025,
    cover: '/covers/charon.jpg'
  },
  {
    id: 2,
    title: 'Schwanengesang',
    artist: '1000 Eyes',
    year: 2025,
    cover: '/covers/Schwanengesang.png'
  },
];

export const useAlbums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = () => {
      try {
        setAlbums(mockAlbums);

      } catch (e) {
        setError('Не удалось загрузить альбомы.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, []);

  return { albums, isLoading, error };
};