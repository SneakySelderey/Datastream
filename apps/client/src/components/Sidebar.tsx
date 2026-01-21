import React from 'react';
import { Link } from 'react-router-dom';
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
    <aside className={`fixed top-12 bottom-0 left-0 w-55 bg-accent z-40 transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <nav className="flex-column">
        <div>
          <a href='#' className={itemClasses}>
            <span>{t('albums')}</span>
          </a>
        </div>

        <div className='flex-column pl-5'>
          <Link to='/albums?sort=name' className={itemClasses}>
            <AlbumsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('all')}</span>
          </Link>
        </div>

        <div className='flex-column pl-5'>
          <Link to='/albums?sort=random' className={itemClasses}>
            <RandomAlbums className="w-6 h-6 stroke-current fill-current" />
            <span>{t('random')}</span>
          </Link>
        </div>

        <div className='flex-column pl-4'>
          <Link to='/albums?sort=recently-added' className={itemClasses}>
            <RecentlyAdded className="w-8 h-8 mr-2 stroke-current fill-current" />
            <span>{t('recently_added')}</span>
          </Link>
        </div>

        <div className='flex-column pl-5'>
          <Link to='/albums?sort=recently-played' className={itemClasses}>
            <RecentlyPlayed className="w-6 h-6 stroke-current fill-current" />
            <span>{t('recently_played')}</span>
          </Link>
        </div>

        <div className='flex-column pl-5'>
          <Link to='/albums?sort=most-played' className={itemClasses}>
            <MostPlayed className="w-6 h-6 stroke-current fill-current" />
            <span>{t('most_played')}</span>
          </Link>
        </div>

        <div className='flex-column'>
          <Link to='artists' className={itemClasses}>
            <ArtistsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('artists')}</span>
          </Link>
        </div>

        <div className='flex-column'>
          <Link to='songs' className={itemClasses}>
            <SongsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('songs')}</span>
          </Link>
        </div>

        <div className='flex-column'>
          <Link to='playlists' className={itemClasses}>
            <PlaylistsIcon className="w-6 h-6 stroke-current fill-current" />
            <span>{t('playlists')}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
