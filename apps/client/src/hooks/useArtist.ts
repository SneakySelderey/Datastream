import { useState, useEffect } from 'react';
import { type Artist } from '../types';

const mockArtistsData: Artist[] = [
  { id: '1', name: '1000 Eyes', createdAt: new Date(0).toISOString() },
  { id: '2', name: 'Stellar', createdAt: new Date(0).toISOString() },
  { id: '3', name: 'Echo', createdAt: new Date(0).toISOString() },
];

export const useArtist = (artistId: string) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = () => {
      setIsLoading(true);

      try {
        const found = mockArtistsData.find(a => a.id === artistId);
        
        if (found) {
          setArtist(found);
        } else {
          setError('Artist not found');
        }
      } catch (e) {
        setError('Cannot load artist');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (artistId) {
      fetchArtist();
    }
  }, [artistId]);

  return { artist, isLoading, error };
};
