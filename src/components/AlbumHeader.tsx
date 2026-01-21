import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type Album } from '../types';

interface AlbumHeaderProps {
  album: Album;
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({ album }) => {
  const navigate = useNavigate();

  const handleGenreClick = (genre: string) => {
    navigate(`/albums/all?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div className='flex flex-col md:flex-row items-center md:items-start gap-4'>
      <img 
        src={album.cover} 
        alt={`Cover for ${album.title}`}
        className='w-50 h-50 md:w-64 md:h-64 object-cover rounded-lg' 
      />
      <div className='flex flex-col pt-2 gap-1'>
        <h1 className='text-2xl'>{album.title}</h1>

        <h2>
          <Link 
            to={`/artists/${album.artistId}`} 
            className="hover:underline hover:text-primary transition-colors text-link"
          >
            {album.artist}
          </Link>
        </h2>

        <p>
          {album.date} &bull; {album.trackCount} Songs &bull; {album.duration} &bull; {album.size}
        </p>

        {album.genres && album.genres.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2 justify-center md:justify-start'>
            {album.genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className='px-3 py-1 text-sm cursor-pointer rounded-full border border-fg/25 hover:bg-fg/10 hover:border-fg/40 transition-colors'
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumHeader;