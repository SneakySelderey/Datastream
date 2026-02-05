import { useState, useEffect, useMemo } from 'react';
import { type Track, type FilterState, type OrderMode } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface TracksResponse {
  data: Track[];
  total: number;
  meta: {
    genres: string[];
    years: string[];
  }
} 

export const useTracks = (page: number, limit: number, filters: FilterState, orderMode: OrderMode = 'default') => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const { playCounts, libraryVersion } = usePlayer();

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          order: orderMode,
        });

        if (filters.search) params.append('search', filters.search);
        if (filters.genre) params.append('genre', filters.genre);
        if (filters.year) params.append('year', filters.year);

        const response = await fetch(`/api/tracks?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch tracks');
        
        const json: TracksResponse = await response.json();
        
        setTracks(json.data);
        setTotal(json.total);
        setAvailableGenres(json.meta.genres);
        setAvailableYears(json.meta.years);

      } catch (e) {
        setError('Cannot load tracks.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();

  }, [page, limit, filters, orderMode, libraryVersion]);

  const tracksWithPlays = useMemo(
    () => tracks.map(track => {
      const plays = playCounts[track.id];
      return plays === undefined ? track : { ...track, plays };
    }),
    [tracks, playCounts]
  );

  return { tracks: tracksWithPlays, total, isLoading, error, availableGenres, availableYears };
};