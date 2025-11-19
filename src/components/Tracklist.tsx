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
    <div className="grid grid-cols-[auto_auto_auto_repeat(7,1fr)] gap-x-6 text-sm">

      <div className="col-span-full grid grid-cols-subgrid gap-x-6 items-center
          text-fg font-bold p-3 border border-fg/10 rounded-t-xl">
        <p>0</p>
        <p className="text-center">#</p>
        <p>{t('trackTitle')}</p>
        <p>{t('artist')}</p>
        <p>{t('duration')}</p>
        <p>{t('played')}</p>
        <p>{t('quality')}</p>
        <p>{t('fileSize')}</p>
        <p>{t('genres')}</p>
        <p></p>
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
          <p>{track.title}</p>
          <p>{track.artist}</p>
          <p>{track.duration}</p>
          <p>{track.plays}</p>
          <p>{track.quality}</p>
          <p>{track.size}</p>
          <p className="truncate">{Array.isArray(track.genres) ? track.genres.join(', ') : ''}</p>
          <div className="flex justify-center">...</div>
        </div>
      ))}
    </div>
  );
}; 

export default Tracklist;