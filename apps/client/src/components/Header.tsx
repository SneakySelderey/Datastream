import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UpdateIcon from '../assets/update.svg?react';
import UserIcon from '../assets/user.svg?react';
import ThemeIcon from '../assets/theme.svg?react';
import MenuIcon from '../assets/burger-menu.svg?react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../types';

const pageTitleKeys: { [key: string]: string } = {
  'albums': 'albums',
  'artists': 'artists',
  'songs': 'songs',
  'playlists': 'playlists',
  'account': 'account',
};

interface HeaderProps {
  onChangeTheme: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onChangeTheme, onToggleSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isRescanRequestInFlight, setIsRescanRequestInFlight] = useState(false);
  const [isRescanMenuOpen, setIsRescanMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { scanProgress, lastRescanInfo } = usePlayer();
  const isScanActive =
    scanProgress.status === 'running' || scanProgress.status === 'finalizing';
  const isRescanning = isScanActive || isRescanRequestInFlight;

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

  const handleRescan = async () => {
    if (isRescanning) return;
    setIsRescanRequestInFlight(true);
    try {
      await fetch('/api/scanner/rescan', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRescanRequestInFlight(false);
    }
  };

  const handleFullRescan = async () => {
    if (isRescanning) return;
    setIsRescanRequestInFlight(true);
    try {
      await fetch('/api/scanner/full-rescan', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRescanRequestInFlight(false);
    }
  };

  const formatLastRescanTime = () => {
    if (!lastRescanInfo?.finishedAt) return t('notAvailable');
    return new Date(lastRescanInfo.finishedAt).toLocaleString();
  };

  const formatDuration = () => {
    if (!lastRescanInfo) return t('notAvailable');
    return formatTime(lastRescanInfo.durationMs / 1000);
  };

  useEffect(() => {
    if (!isRescanMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsRescanMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isRescanMenuOpen]);

  return (
    <div className='fixed top-0 left-0 right-0 p-3 pr-6 pl-6 bg-bg text-fg z-50 shadow-md flex justify-between items-center
        transition-colors duration-300 ease-in-out'>
      <div className='flex items-center gap-6'>
        <button
          onClick={onToggleSidebar}
          className="text-fg transition-colors duration-300 ease-in-out"
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

        <div className='relative' ref={menuRef}>
          <button
            onClick={() => setIsRescanMenuOpen(prev => !prev)}
            title={t('rescanLibrary', 'Rescan library')}
            aria-label={t('rescanLibrary', 'Rescan library')}
          >
            <UpdateIcon className='w-6 h-6 cursor-pointer stroke-current translate-y-[3px]' />
          </button>

          {isRescanMenuOpen && (
            <div className='absolute right-0 top-10 w-72 rounded-md border border-fg/20 bg-bg p-3 shadow-lg z-50'>
              <div className='mb-3 flex gap-2'>
                <button
                  onClick={handleRescan}
                  disabled={isRescanning}
                  className='w-full rounded-md border border-fg/20 px-3 py-2 text-left hover:bg-fg/10 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {t('rescan')}
                </button>

                <button
                  onClick={handleFullRescan}
                  disabled={isRescanning}
                  className='w-full rounded-md border border-fg/20 px-3 py-2 text-left hover:bg-fg/10 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {t('fullRescan', 'Full rescan')}
                </button>
              </div>

              {isScanActive && (
                <p className='mb-3 text-sm text-fg/80'>
                  {scanProgress.status === 'finalizing'
                    ? t('scanFinalizing', 'Finalizing scan...')
                    : t('scanProgress', {
                        scanned: scanProgress.foldersScanned,
                        total: scanProgress.totalFolders,
                      })}
                </p>
              )}

              <div className='text-sm space-y-1 text-fg/80'>
                <p>{t('lastRescanTime')}: {formatLastRescanTime()}</p>
                <p>{t('lastRescanDuration')}: {formatDuration()}</p>
                <p>{t('lastRescanFolders')}: {lastRescanInfo?.totalFolders ?? t('notAvailable')}</p>
              </div>
            </div>
          )}
        </div>
        
        <Link to='/account'>
          <UserIcon className='w-6 h-6 cursor-pointer fill-current' />
        </Link>
      </div>
    </div>
  )
}

export default Header
