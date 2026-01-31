import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { TracklistModal } from './TracklistModal';

import { type Track, formatTime } from '../types';

interface TracklistProps {
  tracks: Track[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
  showAlbum?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const Tracklist: React.FC<TracklistProps> = ({
  tracks,
  onPlayTrack,
  showAlbum = false,
  selectedIds = [],
  onSelectionChange
}) => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const desktopGridClass = showAlbum
    ? 'md:grid-cols-[auto_auto_auto_auto_auto_repeat(6,1fr)]'
    : 'md:grid-cols-[auto_auto_auto_auto_repeat(6,1fr)]';

  const isAllSelected = tracks.length > 0 && tracks.every(track => selectedIds.includes(track.id));

  const handleToggleTrack = (id: string) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleToggleAll = () => {
    if (!onSelectionChange) return;

    if (isAllSelected) {
      const currentTrackIds = tracks.map(t => t.id);
      onSelectionChange(selectedIds.filter(id => !currentTrackIds.includes(id)));
    } else {
      const currentTrackIds = tracks.map(t => t.id);
      const newSet = new Set([...selectedIds, ...currentTrackIds]);
      onSelectionChange(Array.from(newSet));
    }
  };

   const handleSuccess = () => {
    alert(t('tracksAddedToPlaylist'));
    if (onSelectionChange) onSelectionChange([]);
  };

  return (
    <div>
      {selectedIds.length > 0 && onSelectionChange && (
        <div className="relative"> 
          <div className="absolute left-0 right-0 -top-20 z-10 p-3 bg-bg border border-fg/20 rounded-xl shadow-sm flex items-center
                          transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-1.5 border border-fg/30 text-sm rounded-lg cursor-pointer
                           transition-all duration-300 ease-in-out"
              >
                {t('addToPlaylist')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-x-6 text-sm
          grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto]
          ${desktopGridClass}`}>

        <div className="col-span-full grid grid-cols-subgrid gap-x-6 items-center text-center
            text-fg font-bold p-3 border border-fg/25 rounded-t-xl transition-all duration-300 ease-in-out">

          <div className="flex items-center justify-center w-5">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleAll}
              className="w-4 h-4 accent-primary cursor-pointer"
              disabled={!onSelectionChange}
            />
          </div>

          <p>#</p>
          <p className="text-left">{t('trackTitle')}</p>
          <p className="text-left">{t('artist')}</p>

          {showAlbum && (
            <p className="hidden text-left md:block">{t('album')}</p>
          )}

          <p>{t('duration')}</p>
          <p className="hidden md:block">{t('played')}</p>
          <p className="hidden md:block">{t('quality')}</p>
          <p className="hidden md:block">{t('fileSize')}</p>
          <p className="hidden md:block">{t('genres')}</p>
          <p className="hidden md:block"></p>
        </div>

        {tracks.map((track, index) => {
          const isSelected = selectedIds.includes(track.id);

          return (
            <div
              key={track.id}
              onClick={() => { if (!showAlbum) { onPlayTrack(track, tracks) } else { onPlayTrack(track, [track]) } }}
              className="col-span-full grid grid-cols-subgrid gap-x-6 items-center text-center px-3
                      border-x border-b border-fg/25 hover:bg-accent transition-colors
                      last:rounded-b-xl last:shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-center w-5 py-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleTrack(track.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-primary cursor-pointer"
                  disabled={!onSelectionChange}
                />
              </div>

              <p className="py-3">{index + 1}</p>
              <p className="text-left text-wrap">{track.title}</p>

              <Link
                to={`/artists/${track.artists[0]?.id}`}
                className="hover:underline relative text-link text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {track.artists[0]?.name}
              </Link>

              {showAlbum && (
                <div className="hidden md:block text-link text-left">
                  <Link
                    to={`/albums/${track.albumId}`}
                    className="hover:underline relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {track.album.title}
                  </Link>
                </div>
              )}

              <p>{formatTime(Number(track.duration))}</p>
              <p className="hidden md:block">{track.plays}</p>
              <p className="hidden md:block">{track.format}</p>
              <p className="hidden md:block">{(track.size / 1048576).toFixed(2)} MB</p>
              <p className="hidden md:block text-wrap">{Array.isArray(track.genres) ? track.genres.map(g => g.name).join(', ') : ''}</p>
              <div className="hidden md:flex justify-center">...</div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <TracklistModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          trackIds={selectedIds}
        />
      )}
    </div>
  );
};

export default Tracklist;
