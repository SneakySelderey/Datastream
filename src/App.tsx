import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';

import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailsPages from './pages/AlbumDetailsPage'; 

import Header from './components/Header'
import Sidebar from './components/Sidebar';
import Player from './components/Player';

import { useLocalStorage } from './hooks/useLocalStorage';
import { PlayerProvider } from './context/PlayerContext'; 

import { type Theme } from './types';

function App() {
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>('app-theme', 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleThemeChange = () => {
    setCurrentTheme(currentTheme == 'light' ? 'dark' : 'light');
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

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
    <PlayerProvider>
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
            <Route path="/albums/:albumId" element={<AlbumDetailsPages />} />
          </Routes>
        </main>
        <Player/>
      </div>
    </PlayerProvider>
  )
}

export default App
