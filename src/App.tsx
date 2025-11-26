import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailsPages from './pages/AlbumDetailsPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailsPage from './pages/ArtistDetailPage';
import TracksPage from './pages/TracksPage';
import PlaylistsPage from './pages/PlaylistsPage';

import Header from './components/Header'
import Sidebar from './components/Sidebar';
import Player from './components/Player';

import { useLocalStorage } from './hooks/useLocalStorage';
import { PlayerProvider } from './context/PlayerContext'; 

import { type Theme } from './types';

function App() {
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>('app-theme', 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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
        {!isAuthPage && (
          <>
            <Header
              onChangeTheme={handleThemeChange}
              onToggleSidebar={handleToggleSidebar}
            />

            <Sidebar isOpen={isSidebarOpen} />

            <Player/>
          </>
        )}

        <main className={`pt-12 pb-24 transition-all duration-300 ease-in-out
          ${!isAuthPage ? 'pt-12 pb-24' : ''} 
          ${!isAuthPage && isSidebarOpen ? 'md:ml-55' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/albums" replace />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/albums/:id" element={<AlbumDetailsPages />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/artists/:id" element={<ArtistDetailsPage />} />
            <Route path="/songs" element={<TracksPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlists/:id" element={<AlbumDetailsPages type="playlist" />} />
          </Routes>
        </main>
      </div>
    </PlayerProvider>
  )
}

export default App
