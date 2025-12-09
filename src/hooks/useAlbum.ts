import { useState, useEffect } from 'react';

import { type Album } from '../types';

const mockAlbums: Album[] = [
  {
    id: '1',
    title: 'Charon',
    artist: '1000 Eyes',
    artistId: '1',
    date: '2025-01-01',
    cover: '/covers/charon.jpg',
    genres: ['Ambient', 'Drum & Bass'],
    tracklist: [],
    trackCount: 0,
    duration: '0',
    size: '0 MB'
  },
  {
    id: '2',
    title: 'Schwanengesang',
    artist: '1000 Eyes',
    artistId: '1',
    date: '2025-01-01',
    cover: '/covers/Schwanengesang.png',
    genres: ['Classical', 'Instrumental'],
    tracklist: [
      { id: '1', trackNumber: 1, plays: 5, size: '15.75 MB', genres: ['classical', 'instrumental'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27)', artist: '1000 Eyes', artistId: "1", album: "Schwanengesang", albumId: "2", src: '/music/01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27).flac', cover: '/covers/Schwanengesang.png', duration: '03:13', quality: 'FLAC' },
      { id: '2', trackNumber: 2, plays: 2, size: '25.15 MB', genres: ['classical', 'instrumental'], title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw)', artist: '1000 Eyes', artistId: "1", album: "Schwanengesang", albumId: "2", src: '/music/02 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27.slw).flac', cover: '/covers/Schwanengesang.png', duration: '02:33', quality: 'FLAC' }
    ],
    trackCount: 0,
    duration: '0',
    size: '0 MB'
  },
];

const mockPlaylists: Album[] = [
  {
    id: '1',
    title: 'Chill Vibes',
    artist: 'User',
    artistId: '11',
    date: '2024',
    cover: '/covers/chill-vibes.jpg',
    genres: [],
    tracklist: [
       { id: '10', trackNumber: 1, plays: 50, size: '5 MB', genres: ['Pop'], title: 'Best Song Ever', artist: 'Artist 1', artistId: "31", album: "Single", albumId: "12", src: '', cover: '', duration: '03:00', quality: 'MP3' },
       { id: '11', trackNumber: 2, plays: 30, size: '4 MB', genres: ['Pop'], title: 'Another Great Song', artist: 'Artist 2', artistId: "32", album: "Single", albumId: "13", src: '', cover: '', duration: '02:45', quality: 'MP3' },
    ],
    trackCount: 1,
    duration: '3:00',
    size: '5 MB'
  }
];

export const useAlbum = (id: string, type: 'album' | 'playlist' = 'album') => {
  const [album, setAlbum] = useState<Album>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = () => {
      setIsLoading(true);

      try {
        const source = type === 'album' ? mockAlbums : mockPlaylists;
        
        const found = source.find((obj) => obj.id === id);
        if (found) {
            setAlbum(found);
            setError(null);
        } else {
            setAlbum(undefined);
        }

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
