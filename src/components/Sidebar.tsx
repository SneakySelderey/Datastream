import React from 'react';
import { useTranslation } from 'react-i18next';

import AlbumsIcon from '../assets/albums.svg?react';
import RandomAlbums from '../assets/random-albums.svg?react';
import RecentlyAdded from '../assets/recently-added.svg?react';
import RecentlyPlayed from '../assets/recently-played.svg?react';
import MostPlayed from '../assets/most-played.svg?react';
import ArtistsIcon from '../assets/artists.svg?react';
import SongsIcon from '../assets/songs.svg?react';
import PlaylistsIcon from '../assets/playlists.svg?react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const itemClasses = 'flex items-center space-x-3 p-3 pl-5 text-fg hover:bg-hv transition-colors duration-300 ease-in-out'
  const { t } = useTranslation();

  return (
    <aside className={`fixed top-12 bottom-0 left-0 w-55 bg-accent z-40 transform transition-colors duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <nav className="flex-column">
        <div>
          <a href='#' className={itemClasses}>
            <span>{t('albums')}</span>
          </a>
        </div>

        <div className='flex-column pl-5'>
          <a href='#' className={itemClasses}>
            <AlbumsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('all')}</span>
          </a>
        </div>

        <div className='flex-column pl-5'>
          <a href='#' className={itemClasses}>
            <RandomAlbums className="w-6 h-6 stroke-current fill-current" />
            <span>{t('random')}</span>
          </a>
        </div>

        <div className='flex-column pl-4'>
          <a href='#' className={itemClasses}>
            <RecentlyAdded className="w-8 h-8 mr-2 stroke-current fill-current" />
            <span>{t('recently_added')}</span>
          </a>
        </div>

        <div className='flex-column pl-5'>
          <a href='#' className={itemClasses}>
            <RecentlyPlayed className="w-6 h-6 stroke-current fill-current" />
            <span>{t('recently_played')}</span>
          </a>
        </div>

        <div className='flex-column pl-5'>
          <a href='#' className={itemClasses}>
            <MostPlayed className="w-6 h-6 stroke-current fill-current" />
            <span>{t('most_played')}</span>
          </a>
        </div>

        <div className='flex-column'>
          <a href='#' className={itemClasses}>
            <ArtistsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('artists')}</span>
          </a>
        </div>

        <div className='flex-column'>
          <a href='#' className={itemClasses}>
            <SongsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('songs')}</span>
          </a>
        </div>

        <div className='flex-column'>
          <a href='#' className={itemClasses}>
            <PlaylistsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('playlists')}</span>
          </a>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;