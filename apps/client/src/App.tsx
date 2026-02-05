import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import AlbumsPage from './pages/AlbumsPage';
import AlbumDetailsPages from './pages/AlbumDetailsPage';
import ArtistsPage from './pages/ArtistsPage';
import ArtistDetailsPage from './pages/ArtistDetailPage';
import TracksPage from './pages/TracksPage';
import PlaylistsPage from './pages/PlaylistsPage';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Player from './components/Player/Player';
import { ProtectedRoute } from './components/Routing/ProtectedRoute';
import { PublicRoute } from './components/Routing/PublicRoute';

import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';

import { type Theme } from './types';

function AppContent() {
  const [currentTheme, setCurrentTheme] = useLocalStorage<Theme>('app-theme', 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleThemeChange = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }, [currentTheme]);

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
      <div className="min-h-screen bg-bg text-fg transition-colors duration-300 ease-in-out">
        {user && !isAuthPage && (
          <>
            <Header onChangeTheme={handleThemeChange} onToggleSidebar={handleToggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} />
            <Player />
          </>
        )}

        <main
          className={`transition-all duration-300 ease-in-out
            ${user && !isAuthPage ? 'pt-12 pb-24' : ''} 
            ${user && !isAuthPage && isSidebarOpen ? 'md:ml-55' : ''}`}
        >
          <div key={location.pathname} className="animate-fade-in-soft">
            <Routes>
              <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />

              <Route path="/" element={<ProtectedRoute><Navigate to="/albums" replace /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/albums" element={<ProtectedRoute><AlbumsPage /></ProtectedRoute>} />
              <Route path="/albums/:id" element={<ProtectedRoute><AlbumDetailsPages /></ProtectedRoute>} />
              <Route path="/artists" element={<ProtectedRoute><ArtistsPage /></ProtectedRoute>} />
              <Route path="/artists/:id" element={<ProtectedRoute><ArtistDetailsPage /></ProtectedRoute>} />
              <Route path="/songs" element={<ProtectedRoute><TracksPage /></ProtectedRoute>} />
              <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
              <Route path="/playlists/:id" element={<ProtectedRoute><AlbumDetailsPages type="playlist" /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/albums" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </PlayerProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;