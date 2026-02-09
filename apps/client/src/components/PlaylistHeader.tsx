import React from 'react';
import { type Playlist, buildCoverUrl, formatTime, formatFileSize } from '../types';

interface PlaylistHeaderProps {
  playlist: Playlist;
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ playlist }) => {
  const coverUrl = buildCoverUrl(playlist.tracks?.[0]?.coverPath);

  const trackCount = playlist.tracks?.length ?? 0;
  const totalDuration = (playlist.tracks ?? []).reduce((acc, track) => acc + track.duration, 0);
  const totalSize = (playlist.tracks ?? []).reduce((acc, track) => acc + track.size, 0);

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
      <img
        src={coverUrl ?? ''}
        alt={`Cover for ${playlist.title}`}
        className="w-50 h-50 md:w-64 md:h-64 object-cover rounded-lg"
      />
      <div className="flex flex-col pt-2 gap-1">
        <h1 className="text-2xl">{playlist.title}</h1>
        <p>
          {formatDate(playlist.updatedAt)} &bull; {trackCount} Songs &bull; {formatTime(totalDuration)} &bull; {formatFileSize(totalSize)}
        </p>
      </div>
    </div>
  );
};

export default PlaylistHeader;
