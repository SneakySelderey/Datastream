import React from 'react';
import { useTranslation } from 'react-i18next';

import { type ArtistListItem, formatFileSize } from '../types';

interface ArtistListProps {
  artists: ArtistListItem[];
  onSelectArtist: (artist: ArtistListItem) => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ artists, onSelectArtist }) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-x-6 text-sm
        grid-cols-[auto_minmax(0,1fr)_auto_auto] 
        md:grid-cols-[auto_repeat(6,1fr)]">
      
      <div className="col-span-full grid grid-cols-subgrid gap-x-6 items-center text-center
          text-fg font-bold p-3 border border-fg/10 rounded-t-xl">
        <p className="text-center">#</p>
        <p className="text-left">{t('artist')}</p>
        
        <p>{t('albums')}</p>
        <p>{t('songs')}</p>
        <p className="hidden md:block">{t('size')}</p>
        <p className="hidden md:block">{t('plays')}</p>
        
        <p className="hidden md:block"></p>
      </div>

      {artists.map((artist, index) => (
        <div
          key={artist.id}
          onClick={() => onSelectArtist(artist)}
          className="col-span-full grid grid-cols-subgrid gap-x-6 items-center text-center px-3
                     border-x border-b border-fg/10 hover:bg-accent transition-colors
                     last:rounded-b-xl last:shadow-sm cursor-pointer h-12"
        >
          <p className="text-center">{index + 1}</p>
          <p className="wrap text-left">{artist.name}</p>
          
          <p className="text-center text-fg/80">{artist.albumCount}</p>
          <p className="text-center text-fg/80">{artist.songCount}</p>
          <p className="hidden md:block text-fg/80">{formatFileSize(artist.size)}</p>
          <p className="hidden md:block text-fg/80">{artist.plays}</p>
          
          <div className="hidden md:flex justify-center text-fg/50">...</div>
        </div>
      ))}
    </div>
  );
};

export default ArtistList;
