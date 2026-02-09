import { useState, useEffect, useMemo } from 'react';

import { type Album, type Playlist } from '../types';
import { usePlayer } from '../context/PlayerContext';

export const useAlbum = (id: string, type: 'album' | 'playlist' = 'album') => {
  const [album, setAlbum] = useState<Album | Playlist>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { playCounts, libraryVersion } = usePlayer();

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

  }, [id, type, libraryVersion]);

  const albumWithPlays = useMemo(() => {
    const tracks = album?.tracks?.map(track => {
      const plays = playCounts[track.id];
      
      return plays === undefined ? track : { ...track, plays };
    });

    return { ...album, tracks };
  }, [album, playCounts]);

  return { album: albumWithPlays, isLoading, error };
};
