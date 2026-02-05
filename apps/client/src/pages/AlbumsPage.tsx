import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAlbums } from '../hooks/useAlbums';
import { useLocalStorage } from '../hooks/useLocalStorage';

import CollectionGrid from '../components/CollectionGrid/CollectionGrid';
import AlbumCard from '../components/CollectionGrid/AlbumCard';
import PaginationControls from '../components/PaginationControls';
import Filters from '../components/Filters';

import { type Album, type FilterState, type OrderMode } from '../types';

const AlbumsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 18);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: searchParams.get('genre') || '',
    year: '',
  });

  const orderMode = (searchParams.get('order') as OrderMode) || 'default';
  
  const { albums, total, isLoading, error, availableGenres, availableYears } = useAlbums(currentPage, itemsPerPage, filters, orderMode);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (orderMode) params.order = orderMode;

    if (filters.genre) params.genre = filters.genre;
    if (filters.search) params.search = filters.search;
    if (filters.year) params.year = filters.year;
    
    setSearchParams(params, { replace: true });
  }, [filters, orderMode, setSearchParams]);

  const handleOrderChange = (newOrder: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('order', newOrder);
      return newParams;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setFilters(prev => ({ ...prev, search: val }));
    setCurrentPage(1);
  };
  
  const handleGenreChange = (val: string) => {
    setFilters(prev => ({ ...prev, genre: val }));
    setCurrentPage(1);
  };

  const handleYearChange = (val: string) => {
    setFilters(prev => ({ ...prev, year: val }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSelectAlbum = (album: Album) => {
    navigate(`/albums/${album.id}`);
  };

  return (
    <div className='m-5 animate-fade-in-soft'>    
      {isLoading && <p>{t('loading')}</p>}

      {error && <p>{error}</p>}

      <Filters 
        search={filters.search}
        genre={filters.genre}
        year={filters.year}
        genres={availableGenres}
        years={availableYears}
        orderMode={orderMode}
        onSearchChange={handleSearchChange}
        onGenreChange={handleGenreChange}
        onYearChange={handleYearChange}
        onOrderChange={handleOrderChange}
      />

      {!isLoading && !error && (
        <CollectionGrid
          items={albums}
          renderItem={(album) => (
            <AlbumCard album={album} onSelect={handleSelectAlbum} />
          )}
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
