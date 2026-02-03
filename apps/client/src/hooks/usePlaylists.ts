import { useState, useEffect, useCallback } from 'react';
import { type PlaylistListItem } from '../types';

export const usePlaylists = (page: number, limit: number, search: string) => {
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/playlists?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      
      const data = await response.json();
      setPlaylists(data);
      setTotal(data.length);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (title: string): Promise<string> => {
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, trackIds: [] }),
      });
      
      if (!response.ok) throw new Error('Failed to create playlist');
      
      const newPlaylist = await response.json();
      
      fetchPlaylists();
      
      return newPlaylist.id;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return { playlists, total, isLoading, error, createPlaylist, refresh: fetchPlaylists };
};
