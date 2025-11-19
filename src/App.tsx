import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';

import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailsPages from './pages/AlbumDetailsPage'; 

import Header from './components/Header'
import Sidebar from './components/Sidebar';
import Player from './components/Player';

import { useLocalStorage } from './hooks/useLocalStorage';

import { type Theme, type Track} from './types';

const defaultTrack: Track = { 
  id: 0, trackNumber: 0, plays: 0, size: '0 MB', genres: [], 
  title: 'Select a track to play', artist: '...', 
  src: '', cover: '', duration: '00:00', quality: 'FLAC' 
};

function App() {
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>('app-theme', 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentTrack, setCurrentTrack] = useLocalStorage<Track>('player-current-track', defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useLocalStorage<Track[]>('player-queue', []);

  const handleThemeChange = () => {
    setCurrentTheme(currentTheme == 'light' ? 'dark' : 'light');
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  const handlePlayTrack = (track: Track, newQueue: Track[]) => {
    setQueue(newQueue);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handlePlayFromQueue = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
  }, [currentTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    setIsSidebarOpen(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsSidebarOpen(e.matches);
    };

    mediaQuery.addEventListener('change', handleResize);

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  return (
    <div className='min-h-screen bg-bg text-fg transition-colors duration-300 ease-in-out'>
      <Header
        onChangeTheme={handleThemeChange}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar
        isOpen={isSidebarOpen}
      />

      <main className={`pt-12 pb-24 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-55' : ''}`}>
         <Routes>
          <Route path="/" element={<Navigate to="/albums/all" replace />} />
          <Route path="/albums/all" element={<AlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumDetailsPages onPlayTrack={handlePlayTrack} />} />
        </Routes>
      </main>
      <Player 
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlayPause}
        queue={queue} 
        onPlayTrack={handlePlayFromQueue} 
      />
    </div>
  )
}

export default App
