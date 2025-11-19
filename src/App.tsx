import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';

import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailsPages from './pages/AlbumDetailsPage'; 

import Header from './components/Header'
import Sidebar from './components/Sidebar';
import Player from './components/Player';

import { type Theme, type Track} from './types';

const defaultTrack: Track = { 
  id: 0, trackNumber: 0, plays: 0, size: '0 MB', genres: [], 
  title: 'Select a track to play', artist: '...', 
  src: '', cover: '', duration: '00:00', quality: 'FLAC' 
};

function App() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentTrack, setCurrentTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

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

  const handleNextTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    }
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
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        hasNext={queue.findIndex(t => t.id === currentTrack.id) < queue.length - 1}
        hasPrev={queue.findIndex(t => t.id === currentTrack.id) > 0}
      />
    </div>
  )
}

export default App
