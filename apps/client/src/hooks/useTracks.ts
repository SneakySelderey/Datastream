import { useState, useEffect } from 'react';
import { type Track, type FilterState, type SortMode } from '../types';

const seedTracks: Track[] = [
  { id: '1', trackNumber: 1, plays: 5, size: '15.75 MB', genres: ['classical', 'instrumental'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27)', artist: '1000 Eyes', artistId: "1", album: "Schwanengesang", albumId: "2", src: '/music/01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27).flac', cover: '/covers/Schwanengesang.png', duration: '03:13', quality: 'FLAC' },
  { id: '2', trackNumber: 2, plays: 2, size: '25.15 MB', genres: ['classical', 'instrumental'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw)', artist: '1000 Eyes', artistId: "1", album: "Schwanengesang", albumId: "2", src: '/music/02 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw).flac', cover: '/covers/Schwanengesang.png', duration: '02:33', quality: 'FLAC' }
];

const allMockTracks: Track[] = [];
for (let i = 0; i < 100; i++) {
  const template = seedTracks[i % seedTracks.length];
  allMockTracks.push({
    ...template,
    id: `${i + 1}`,
    title: template.title
  });
}

export const useTracks = (page: number, limit: number, filters: FilterState, sortMode: SortMode = 'default') => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const availableGenres = ['Classical', 'Instrumental'];
  const availableYears = ['2025'];

  useEffect(() => {
    const fetchTracks = () => {
      setIsLoading(true);
      try {
        let result = [...allMockTracks];

        if (sortMode === 'random') {
          // rand
        } else if (sortMode === 'recently-added') {
          // recently added
        }
        // ...

        const filteredTotal = result.length;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const slicedTracks = result.slice(startIndex, endIndex);
        
        setTracks(slicedTracks);
        setTotal(filteredTotal);

      } catch (e) {
        setError('Cannot load tracks.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();

  }, [page, limit, filters, sortMode]);

  return { tracks, total, isLoading, error, availableGenres, availableYears };
};