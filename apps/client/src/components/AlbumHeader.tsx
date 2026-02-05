import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type Album, formatTime, formatFileSize, buildCoverUrl } from '../types';

interface AlbumHeaderProps {
  album: Album;
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({ album }) => {
  const navigate = useNavigate();
  const coverUrl = buildCoverUrl(album.coverPath ?? album.tracks?.[0]?.coverPath);

  const trackCount = album.tracks?.length ?? 0;
  const totalDuration = (album.tracks ?? []).reduce((acc, track) => acc + track.duration, 0);
  const totalSize = (album.tracks ?? []).reduce((acc, track) => acc + track.size, 0);

  const genreMap = new Map<string, { id: string; name: string }>();
  (album.tracks ?? []).forEach((track) => {
    (track.genres ?? []).forEach((genre) => {
      genreMap.set(genre.id, { id: genre.id, name: genre.name });
    });
  });
  const uniqueGenres = Array.from(genreMap.values());

  const handleGenreClick = (genre: string) => {
    navigate(`/albums/all?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
      <img 
        src={coverUrl ?? ''} 
        alt={`Cover for ${album.title}`}
        className='w-50 h-50 md:w-64 md:h-64 object-cover rounded-lg' 
      />
      <div className='flex flex-col pt-2 gap-1'>
        <h1 className='text-2xl'>{album.title}</h1>

        <h2>
          {album.artists && album.artists.length > 0 ? (
            <span className="text-link">
              {album.artists.map((artist, artistIndex) => (
                <span key={artist.id ?? `album-artist-${artistIndex}`}>
                  {artist.id ? (
                    <Link
                      to={`/artists/${artist.id}`}
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      {artist.name}
                    </Link>
                  ) : (
                    <span className="text-fg/70">{artist.name}</span>
                  )}
                  {artistIndex < (album.artists?.length ?? 0) - 1 && <span>, </span>}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-fg/70">—</span>
          )}
        </h2>

        <p>
          {album.date ?? '—'} &bull; {trackCount} Songs &bull; {formatTime(totalDuration)} &bull; {formatFileSize(totalSize)}
        </p>

        {uniqueGenres.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2 justify-center md:justify-start'>
            {uniqueGenres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.name)}
                className='px-3 py-1 text-sm cursor-pointer rounded-full border border-fg/25 hover:bg-fg/10 hover:border-fg/40 transition-colors'
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumHeader;
