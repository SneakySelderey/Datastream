import { useState, useEffect } from 'react';

import { type Album } from '../types';

const mockAlbums: Album[] = [
  {
    id: 1,
    title: 'Chronoscape',
    artist: 'Vector Shift',
    year: 2023,
    cover: '/covers/album1.jpg'
  },
  {
    id: 2,
    title: 'Ethereal Echoes',
    artist: 'Luna Bloom',
    year: 2022,
    cover: '/covers/album2.png'
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