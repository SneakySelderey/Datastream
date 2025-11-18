import { useState, useEffect } from 'react'

import Header from './components/Header'
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import AlbumGrid from './components/AlbumGrid';

import { type Theme, type Track, type Album } from './types';

import { useAlbums } from './hooks/useAlbums';

const trackList = [
  { id: 1, title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27)', artist: '1000 Eyes', src: '/music/01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27).flac', cover: '/covers/Schwanengesang.png' },
  { id: 2, title: 'Ocean Drive', artist: 'Night Rider', src: '/music/song2.mp3', cover: '/covers/cover2.jpg' },
];

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentTrack, setCurrentTrack] = useState(trackList[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const { albums, isLoading, error } = useAlbums();

  const handleThemeChange = () => {
    setCurrentTheme(currentTheme == 'light' ? 'dark' : 'light');
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  const handleSelectAlbum = (album: Album) => {
    console.log('Album chosen:', album.title);
  };

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
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
         {isLoading && <p>Albums loading</p>}

         {error && <p className="text-red-500">{error}</p>}

         {!isLoading && !error && (
            <AlbumGrid 
              albums={albums} 
              onSelectAlbum={handleSelectAlbum} 
            />
          )}
      </main>
      <Player 
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlayPause}
      />
    </div>
  )
}

export default App
