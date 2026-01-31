import { useState, useEffect } from 'react';

import { type Album } from '../types';

export const useAlbum = (id: string, type: 'album' | 'playlist' = 'album') => {
  const [album, setAlbum] = useState<Album>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = type === 'playlist' 
          ? `/api/playlists/${id}` 
          : `/api/albums/${id}`;

        const response = await fetch(endpoint);
        
        if (!response.ok) {
           throw new Error('Album not found');
        }

        const data = await response.json();
        setAlbum(data);
      } catch (e) {
        setError('Cannot load data.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();

  }, [id, type]);

  return { album, isLoading, error };
};
