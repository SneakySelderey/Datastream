import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAlbum } from '../hooks/useAlbum';

import AlbumHeader from '../components/AlbumHeader';
import Tracklist from '../components/Tracklist';

import PlayIcon from '../assets/play.svg?react';
import ShuffleIcon from '../assets/random-albums.svg?react';
import PlaylistsIcon from '../assets/playlists.svg?react';

import { type Track } from '../types';

interface AlbumDetailsPageProps {
  onPlayTrack: (track: Track, queue: Track[]) => void;
}

const AlbumDetailsPage: React.FC<AlbumDetailsPageProps> = ({ onPlayTrack }) => {
  const { t } = useTranslation();

  const { albumId } = useParams();
  if (!albumId) {
    return <div className="p-6">Error: album ID missing!</div>;
  }

  const { album, isLoading, error } = useAlbum(albumId);

  if (isLoading) {
    return <div className="p-8">{t('loading')}</div>;
  }
  if (error) {
    return <div className="p-8">{t('error')}: {error}</div>;
  }
  if (!album) {
    return <div className="p-8">{t('nothingFound')}</div>;
  }

  return (
    <div className='p-8'>
      <AlbumHeader album={album} />

      <div className='mt-8 flex gap-4 items-center'>
        <button className='flex items-center gap-2 px-6 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'>
          <PlayIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Play</span>
        </button>
        <button className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'>
          <ShuffleIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Shuffle</span>
        </button>
        <button className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'>
          <PlaylistsIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Add to playlist</span>
        </button>
      </div>

      <div className="mt-8">
        <Tracklist tracks={album.tracklist} onPlayTrack={onPlayTrack} />
      </div>
    </div>
  );
};

export default AlbumDetailsPage;