import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAlbums } from '../hooks/useAlbums';
import { useArtist } from '../hooks/useArtist';
import { useLocalStorage } from '../hooks/useLocalStorage';

import AlbumGrid from '../components/AlbumGrid';
import PaginationControls from '../components/PaginationControls';

import { type Album } from '../types';

const ArtistDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { id: artistId } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('artistAlbumsPerPage', 18);

  const { artist, isLoading: isArtistLoading } = useArtist(artistId || '');

  const { albums, total, isLoading, error } = useAlbums(
    currentPage, 
    itemsPerPage, 
    undefined,
    'default', 
    artistId
  );

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSelectAlbum = (album: Album) => {
    navigate(`/albums/${album.id}`);
  };

  return (
    <div className='m-5'>
      <div className="mb-8">
        {isArtistLoading && <p>{t('loading')}</p>}
        
        {!isArtistLoading && (
            <h1 className="text-3xl font-bold">{artist?.name}</h1>
        )}
        
        <p className="mt-2">{t('artistDiscography', 'Discography')}</p>
      </div>

      {isLoading && <p>{t('loading')}</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && albums.length > 0 && (
        <AlbumGrid
          albums={albums} 
          onSelectAlbum={handleSelectAlbum} 
        />
      )}
      
      {!isLoading && !error && albums.length === 0 && (
         <p className="mt-10 text-center text-fg/50">{t('noAlbumsFound')}</p>
      )}

      <PaginationControls 
        totalItems={total}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default ArtistDetailsPage;
