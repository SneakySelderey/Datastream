import { useState, useEffect } from 'react';
import { type Artist, type SortMode } from '../types';

const seedArtists: Artist[] = [
  { id: '1', name: '1000 Eyes', albumCount: 5, songCount: 42, size: '1.2 GB', plays: 15400 },
  { id: '2', name: 'Stellar', albumCount: 2, songCount: 15, size: '450 MB', plays: 3200 },
  { id: '3', name: 'Echo', albumCount: 8, songCount: 90, size: '2.5 GB', plays: 50000 },
  { id: '4', name: 'Vertex', albumCount: 1, songCount: 8, size: '200 MB', plays: 120 },
];

const allMockArtists: Artist[] = [];
for (let i = 0; i < 50; i++) {
  const template = seedArtists[i % seedArtists.length];
  allMockArtists.push({
    ...template,
    id: template.id,
    name: template.name,
    plays: template.plays
  });
}

export const useArtists = (
  page: number, 
  limit: number, 
  search: string, 
  sortMode: SortMode = 'default'
) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = () => {
      setIsLoading(true);
      try {
        let result = [...allMockArtists];

        if (sortMode === 'random') {
          // ...
        } else if (sortMode === 'most-played') {
          // ...
        } else if (sortMode === 'recently-added') {
            // ...
        } else {
            // ...
        }
        result.sort((a, b) => a.name.localeCompare(b.name));

        const filteredTotal = result.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        setArtists(result.slice(startIndex, endIndex));
        setTotal(filteredTotal);

      } catch (e) {
        setError('Cannot load artists.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();

  }, [page, limit, search, sortMode]);

  return { artists, total, isLoading, error };
};