import { useState, useEffect } from 'react';
import { type Artist } from '../types';

export const useArtist = (artistId: string) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/artists/${artistId}`);
        if (!response.ok) throw new Error('Artist not found');

        const data: Artist = await response.json();
        setArtist(data);
      } catch (e) {
        setError('Cannot load artist');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (artistId) fetchArtist();
  }, [artistId]);

  return { artist, isLoading, error };
};
