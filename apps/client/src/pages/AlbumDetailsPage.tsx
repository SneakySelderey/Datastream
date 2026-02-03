import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAlbum } from '../hooks/useAlbum';
import { usePlayer } from '../context/PlayerContext';

import AlbumHeader from '../components/AlbumHeader';
import PlaylistHeader from '../components/PlaylistHeader';
import Tracklist from '../components/Tracklist/Tracklist';
import { type Album, type Playlist } from '../types';

import PlayIcon from '../assets/play.svg?react';
import ShuffleIcon from '../assets/random-albums.svg?react';
import PlaylistsIcon from '../assets/playlists.svg?react';

interface AlbumDetailsPageProps {
  type?: 'album' | 'playlist';
}

const AlbumDetailsPage: React.FC<AlbumDetailsPageProps> = ({ type = 'album' }) => {
  const { t } = useTranslation();

  const { playTrack, addTracks } = usePlayer();

  const { id } = useParams();
  if (!id) {
    return <div className="p-6">Error: album ID missing!</div>;
  }

  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const { album, isLoading, error } = useAlbum(id, type);

  if (isLoading) {
    return <div className="p-8">{t('loading')}</div>;
  }
  if (error) {
    return <div className="p-8">{t('error')}: {error}</div>;
  }
  if (!album) {
    return <div className="p-8">{t('nothingFound')}</div>;
  }

  const tracks = album.tracks ?? [];
  const isPlaylist = type === 'playlist';

  const handleShufflePlay = () => {
    if (!album || tracks.length === 0) return;

    const shuffledTracks = [...tracks];

    for (let i = shuffledTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTracks[i], shuffledTracks[j]] = [shuffledTracks[j], shuffledTracks[i]];
    }

    playTrack(shuffledTracks[0], shuffledTracks);
  };

  return (
    <div className='p-8'>
      {isPlaylist ? (
        <PlaylistHeader playlist={album as Playlist} />
      ) : (
        <AlbumHeader album={album as Album} />
      )}

      <div className='mt-8 flex gap-4 items-center'>
        <button onClick={() => tracks[0] && playTrack(tracks[0], tracks)}
                className='flex items-center gap-2 px-6 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all cursor-pointer'
        >
          <PlayIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>{t('play')}</span>
        </button>
        <button onClick={handleShufflePlay}
                className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all cursor-pointer'
        >
          <ShuffleIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>{t('shuffle')}</span>
        </button>
        <button
                onClick={() => addTracks(tracks)}
                className='flex items-center gap-2 px-4 py-2 border border-fg/30 rounded-full hover:scale-105 transition-all cursor-pointer'
        >
          <PlaylistsIcon className='w-4 h-4 fill-current stroke-current'/>
          <span className='uppercase text-sm'>{t('addPlayQueue')}</span>
        </button>
      </div>

      <div className="mt-8">
        <Tracklist
          tracks={tracks}
          onPlayTrack={playTrack}
          selectedIds={selectedTrackIds}
          onSelectionChange={setSelectedTrackIds}
        />
      </div>
    </div>
  );
};

export default AlbumDetailsPage;
