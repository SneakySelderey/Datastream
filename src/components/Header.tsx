import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UpdateIcon from '../assets/update.svg?react';
import UserIcon from '../assets/user.svg?react';
import ThemeIcon from '../assets/theme.svg?react';
import MenuIcon from '../assets/burger-menu.svg?react';

const pageTitleKeys: { [key: string]: string } = {
  'albums': 'albums',
  'artists': 'artists',
  'songs': 'songs',
  'playlists': 'playlists',
};

interface HeaderProps {
  onChangeTheme: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChangeTheme, onToggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const generatePageTitle = (): string => {
    const { pathname } = location;

    const mainSegment = pathname.split('/')[1] || '';

    const translationKey = pageTitleKeys[mainSegment];

    if (translationKey) {
      const title = t(translationKey);
      return title.charAt(0).toUpperCase() + title.slice(1);
    }

    return ''; 
  };
  
  const pageTitle = generatePageTitle();

  return (
    <div className='fixed top-0 left-0 right-0 p-3 pr-6 pl-6 bg-bg text-fg z-50 shadow-md flex justify-between items-center
        transition-colors duration-300 ease-in-out'>
      <div className='flex items-center gap-6'>
        <button
          onClick={onToggleSidebar}
          className="text-fg"
          title={t('toggleSidebar')}
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-6 h-6 stroke-current" />
        </button>

        <span>Datastream - {pageTitle}</span>
      </div>

      <div className='flex items-center gap-6'>
        <button
          onClick={onChangeTheme}
          title={t('changeTheme')}
          aria-label="Change theme"
        >
          <ThemeIcon className='w-6 h-6 cursor-pointer fill-current' />
        </button>

        <UpdateIcon className='w-6 h-6 cursor-pointer stroke-current' />
        
        <UserIcon className='w-6 h-6 cursor-pointer fill-current' />
      </div>
    </div>
  )
}

export default Header