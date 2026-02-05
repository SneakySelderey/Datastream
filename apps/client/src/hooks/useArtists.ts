import { useState, useEffect } from 'react';
import { type ArtistListItem, type OrderMode } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface ApiArtistResponse {
  data: ArtistListItem[];
  total: number;
}

export const useArtists = (
  page: number, 
  limit: number, 
  search: string, 
  orderMode: OrderMode = 'default'
) => {
  const [artists, setArtists] = useState<ArtistListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { libraryVersion } = usePlayer();

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          order: orderMode,
        });

        if (search) params.append('search', search);

        const response = await fetch(`/api/artists?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch artists');

        const json: ApiArtistResponse = await response.json();

        setArtists(json.data);
        setTotal(json.total);

      } catch (e: any) {
        console.error(e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();

  }, [page, limit, search, orderMode, libraryVersion]);

  return { artists, total, isLoading, error };
};
