import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAlbums } from '../hooks/useAlbums';
import { useLocalStorage } from '../hooks/useLocalStorage';

import AlbumGrid from '../components/AlbumGrid';
import PaginationControls from '../components/PaginationControls';

import { type Album } from '../types';

const AlbumsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 18);
  
  const { albums, total, isLoading, error } = useAlbums(currentPage, itemsPerPage);

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSelectAlbum = (album: Album) => {
    navigate(`/albums/${album.id}`);
  };

  return (
    <div>    
      {isLoading && <p>{t('loading')}</p>}

      {error && <p>{error}</p>}

      {!isLoading && !error && (
        <AlbumGrid 
          albums={albums} 
          onSelectAlbum={handleSelectAlbum} 
        />
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

export default AlbumsPage;
