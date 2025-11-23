import React from 'react';
import { useTranslation } from 'react-i18next';

import { type Track } from '../types';

interface TracklistProps {
  tracks: Track[];
  onPlayTrack: (track: Track, queue: Track[]) => void;
}

const Tracklist: React.FC<TracklistProps> = ({ tracks, onPlayTrack }) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-x-6 text-sm
        grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto]
        md:grid-cols-[auto_auto_auto_repeat(7,1fr)]">

      <div className="col-span-full grid grid-cols-subgrid gap-x-6 items-center
          text-fg font-bold p-3 border border-fg/10 rounded-t-xl">
        <p>0</p>
        <p className="text-center">#</p>
        <p>{t('trackTitle')}</p>
        <p>{t('artist')}</p>
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
          onClick={() => onPlayTrack(track, tracks)}
          className="col-span-full grid grid-cols-subgrid gap-x-6 items-center px-3
                     border-x border-b border-fg/10 hover:bg-accent transition-colors
                     last:rounded-b-xl last:shadow-sm cursor-pointer"
        >
          <p>0</p>
          <p className="text-center py-3">{index + 1}</p>
          <p className="truncate">{track.title}</p>
          <p className="truncate">{track.artist}</p>
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