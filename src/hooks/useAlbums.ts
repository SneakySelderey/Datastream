import { useState, useEffect } from 'react';

import { type Album, type FilterState, type SortMode } from '../types';

const seedAlbums: Album[] = [
  { id: '1', title: 'Charon', artist: '1000 Eyes', date: '2025-01-01', cover: '/covers/charon.jpg', genres: ['Ambient'], tracklist: [], trackCount: 0, duration: '0', size: '0 MB' },
  { id: '2', title: 'Schwanengesang', artist: '1000 Eyes', date: '2025-01-01', cover: '/covers/Schwanengesang.png', genres: ['Classical', 'Instrumental'], tracklist: [], trackCount: 0, duration: '0', size: '0 MB' },
];

const allMockAlbums: Album[] = [];

for (let i = 0; i < 100; i++) {
  const template = seedAlbums[i % seedAlbums.length];

  allMockAlbums.push({
    ...template,
    id: `${i+1}`
  });
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  genre: '',
  year: ''
};

// @ts-ignore
export const useAlbums = (
  page: number,limit: number, filters: FilterState = DEFAULT_FILTERS,
  sortMode: SortMode = 'default', artistId: string = ''
) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const availableGenres = ['Ambient', 'Classical'];
  const availableYears = ['2025'];

  useEffect(() => {
    const fetchAlbums = () => {
      setIsLoading(true);

      try {
        let result = [...allMockAlbums];

        if (artistId) {
          // tell backend to filter by artistId
        }

        if (sortMode === 'random') {
          // tell backend to return random albums
        }
        else if (sortMode === 'recently-added') {
          // tell backend to return recently added albums
        }
        else if (sortMode === 'recently-played') {
          // tell backend to return recently played albums
        }
        else if (sortMode === 'most-played') {
          // tell backend to return most played albums
        }
        else {
           // ...
        }

        const filteredTotal = result.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        setAlbums(result.slice(startIndex, endIndex));
        setTotal(filteredTotal);
      } catch (e) {
        setError('Cannot load album.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, [page, limit, filters, sortMode, artistId]);

  return { albums, total, isLoading, error, availableGenres, availableYears };
};
