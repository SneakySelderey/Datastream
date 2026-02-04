import { useState, useEffect } from 'react';

import { type Album, type FilterState, type SortMode } from '../types';
import { usePlayer } from '../context/PlayerContext';

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
  const { libraryVersion } = usePlayer();

  const availableGenres = ['Ambient', 'Classical'];
  const availableYears = ['2025'];

  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: filters.search || '',
            genre: filters.genre || '',
            year: filters.year || '',
            artistId: artistId || '',
            sort: sortMode
        });

        const response = await fetch(`/api/albums?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch albums');
        }

        const data = await response.json();

        setAlbums(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
        setError('Cannot load albums.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, [page, limit, filters, sortMode, artistId, libraryVersion]);

  return { albums, total, isLoading, error, availableGenres, availableYears };
};
