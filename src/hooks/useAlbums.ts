import { useState, useEffect } from 'react';

import { type Album } from '../types';

const seedAlbums: Album[] = [
  { id: '1', title: 'Charon', artist: '1000 Eyes', date: '2025-01-01', cover: '/covers/charon.jpg', genres: ['Ambient'], tracklist: [], trackCount: 0, duration: '0', size: '0 MB' },
  { id: '2', title: 'Schwanengesang', artist: '1000 Eyes', date: '2025-01-01', cover: '/covers/Schwanengesang.png', genres: ['Classical'], tracklist: [], trackCount: 0, duration: '0', size: '0 MB' },
];

const allMockAlbums: Album[] = [];

for (let i = 0; i < 100; i++) {
  const template = seedAlbums[i % seedAlbums.length];

  allMockAlbums.push({
    ...template,
    id: `${i+1}`
  });
}

export const useAlbums = (page: number, limit: number) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = () => {
      try {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const slicedAlbums = allMockAlbums.slice(startIndex, endIndex);
        
        setAlbums(slicedAlbums);
        setTotal(allMockAlbums.length);

      } catch (e) {
        setError('Cannot load album.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, [page, limit]);

  return { albums, total, isLoading, error };
};
