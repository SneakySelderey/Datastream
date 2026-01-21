import { useState, useEffect } from 'react';
import { type Album } from '../types';

const seedPlaylists: Album[] = [
  { id: '1', title: 'Chill Vibes', artist: 'User', artistId: '11', date: '2025-11-25', cover: '/covers/chill-vibes.jpg', genres: [], tracklist: [], trackCount: 0, duration: '0', size: '0' },
  { id: '2', title: 'Workout', artist: 'User', artistId: '11', date: '2025-11-25', cover: '/covers/workout.jpg', genres: [], tracklist: [], trackCount: 0, duration: '0', size: '0' },
  { id: '3', title: 'Road Trip', artist: 'User', artistId: '11', date: '2025-11-25', cover: '/covers/road-trip.jpg', genres: [], tracklist: [], trackCount: 0, duration: '0', size: '0' },
];

const allMockPlaylists: Album[] = [];
for (let i = 0; i < 20; i++) {
  const template = seedPlaylists[i % seedPlaylists.length];
  allMockPlaylists.push({ ...template, id: `${i+1}`, title: `${template.title} #${i+1}` });
}

export const usePlaylists = (
  page: number, 
  limit: number, 
  search: string
) => {
  const [playlists, setPlaylists] = useState<Album[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = () => {
      setIsLoading(true);
      try {
        let result = [...allMockPlaylists];

        const filteredTotal = result.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        setPlaylists(result.slice(startIndex, endIndex));
        setTotal(filteredTotal);

      } catch (e) {
        setError('Cannot load playlists.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [page, limit, search]);

  return { playlists, total, isLoading, error };
};
