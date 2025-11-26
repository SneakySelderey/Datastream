import { useState, useEffect } from 'react';
import { type Artist } from '../types';

const mockArtistsData: Artist[] = [
  { id: '1', name: '1000 Eyes', albumCount: 5, songCount: 42, size: '1.2 GB', plays: 15400 },
  { id: '2', name: 'Stellar', albumCount: 2, songCount: 15, size: '450 MB', plays: 3200 },
  { id: '3', name: 'Echo', albumCount: 8, songCount: 90, size: '2.5 GB', plays: 50000 },
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
