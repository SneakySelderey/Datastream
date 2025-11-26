import React from 'react';
import { useTranslation } from 'react-i18next';

import { type Track } from '../types';

interface TracklistProps {
  tracks: Track[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
  showAlbum?: boolean;
}

const Tracklist: React.FC<TracklistProps> = ({ tracks, onPlayTrack, showAlbum = false }) => {
  const { t } = useTranslation();

  const desktopGridClass = showAlbum 
    ? 'md:grid-cols-[auto_auto_auto_repeat(8,1fr)]' 
    : 'md:grid-cols-[auto_auto_auto_repeat(7,1fr)]';

  return (
    <div className={`grid gap-x-6 text-sm
        grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto]
        ${desktopGridClass}`}>

      <div className="col-span-full grid grid-cols-subgrid gap-x-6 items-center
          text-fg font-bold p-3 border border-fg/10 rounded-t-xl">
        <p>0</p>
        <p className="text-center">#</p>
        <p>{t('trackTitle')}</p>
        <p>{t('artist')}</p>

        {showAlbum && (
          <p className="hidden md:block">{t('album')}</p>
        )}

        <p>{t('duration')}</p>
        <p className="hidden md:block">{t('played')}</p>
        <p className="hidden md:block">{t('quality')}</p>
        <p className="hidden md:block">{t('fileSize')}</p>
        <p className="hidden md:block">{t('genres')}</p>
        <p className="hidden md:block"></p>
      </div>

      {tracks.map((track, index) => (
        <div
          key={track.id}
          onClick={() => { if (!showAlbum) {onPlayTrack(track, tracks)} else {onPlayTrack(track, [track])} }}
          className="col-span-full grid grid-cols-subgrid gap-x-6 items-center px-3
                     border-x border-b border-fg/10 hover:bg-accent transition-colors
                     last:rounded-b-xl last:shadow-sm cursor-pointer"
        >
          <p>0</p>
          <p className="text-center py-3">{index + 1}</p>
          <p className="truncate">{track.title}</p>
          <p className="truncate">{track.artist}</p>

          {showAlbum && (
            <p className="hidden md:block text-fg/80">
              {track.album}
            </p>
          )}

          <p>{track.duration}</p>
          <p className="hidden md:block">{track.plays}</p>
          <p className="hidden md:block">{track.quality}</p>
          <p className="hidden md:block">{track.size}</p>
          <p className="hidden md:block truncate">{Array.isArray(track.genres) ? track.genres.join(', ') : ''}</p>
          <div className="hidden md:flex justify-center">...</div>
        </div>
      ))}
    </div>
  );
};

export default Tracklist;
