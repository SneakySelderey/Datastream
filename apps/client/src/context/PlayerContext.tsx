import { createContext, useContext, useState, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { type Track } from '../types';

const defaultTrack: Track = { 
  id: '0',
  title: 'Select a track to play',
  discNumber: 1,
  duration: 0,
  bitrate: 0,
  size: 0,
  filePath: '',
  fileName: '',
  format: '',
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  plays: 0,
  artists: [{
    id: '0',
    name: '...',
    createdAt: new Date(0).toISOString(),
  }],
};

interface PlayerContextType {
  currentTrack: Track;
  isPlaying: boolean;
  queue: Track[];
  playTrack: (track: Track, newQueue: Track[]) => void;
  addTracks: (addQueue: Track[]) => void;
  setTrack: (track: Track) => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useLocalStorage<Track[]>('player-queue', []);
  const [currentTrack, setCurrentTrack] = useLocalStorage<Track>('player-current-track', defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track: Track, newQueue: Track[]) => {
    setQueue(newQueue);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const addTracks = (addQueue: Track[]) => {
    for (const track of addQueue) {
      if (!queue.find(t => t.id === track.id)) {
        setQueue(prev => [...prev, track]);
      }
    }
  };

  const setTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, isPlaying, queue, 
      playTrack, addTracks, setTrack, togglePlay 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
