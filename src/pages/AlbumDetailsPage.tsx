import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAlbum } from '../hooks/useAlbum';
import { usePlayer } from '../context/PlayerContext';

import AlbumHeader from '../components/AlbumHeader';
import Tracklist from '../components/Tracklist';

import PlayIcon from '../assets/play.svg?react';
import ShuffleIcon from '../assets/random-albums.svg?react';
import PlaylistsIcon from '../assets/playlists.svg?react';

const AlbumDetailsPage: React.FC = () => {
  const { t } = useTranslation();

  const { playTrack } = usePlayer();

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

  const handleShufflePlay = () => {
    if (!album || album.tracklist.length === 0) return;

    const shuffledTracks = [...album.tracklist];

    for (let i = shuffledTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
    }

    playTrack(shuffledTracks[0], shuffledTracks);
  };

  return (
    <div className='p-8'>
      <AlbumHeader album={album} />

      <div className='mt-8 flex gap-4 items-center'>
        <button onClick={() => playTrack(album.tracklist[0], album.tracklist)}
                className='flex items-center gap-2 px-6 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'
        >
          <PlayIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Play</span>
        </button>
        <button onClick={handleShufflePlay}
                className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'
        >
          <ShuffleIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Shuffle</span>
        </button>
        <button className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all'>
          <PlaylistsIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>Add to playlist</span>
        </button>
      </div>

      <div className="mt-8">
        <Tracklist tracks={album.tracklist} onPlayTrack={playTrack} />
      </div>
    </div>
  );
};

export default AlbumDetailsPage;
