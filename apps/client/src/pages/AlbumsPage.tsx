import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAlbums } from '../hooks/useAlbums';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLocalStorage } from '../hooks/useLocalStorage';

import CollectionGrid from '../components/CollectionGrid/CollectionGrid';
import AlbumCard from '../components/CollectionGrid/AlbumCard';
import PaginationControls from '../components/PaginationControls';
import Filters from '../components/Filters';

import { type Album, type FilterState, type OrderMode } from '../types';

const AlbumsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('itemsPerPage', 18);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: searchParams.get('genre') || '',
    year: '',
  });
  
  const debouncedSearch = useDebouncedValue(filters.search);
  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const orderMode = (searchParams.get('order') as OrderMode) || 'default';

  const { albums, total, isLoading, error, availableGenres, availableYears } = useAlbums(
    currentPage,
    itemsPerPage,
    effectiveFilters,
    orderMode,
  );

  useEffect(() => {
    const params: Record<string, string> = {};
    if (orderMode) params.order = orderMode;

    if (effectiveFilters.genre) params.genre = effectiveFilters.genre;
    if (effectiveFilters.search) params.search = effectiveFilters.search;
    if (effectiveFilters.year) params.year = effectiveFilters.year;
    
    setSearchParams(params, { replace: true });
  }, [effectiveFilters, orderMode, setSearchParams]);

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
    <div className='m-5'>    
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

      {!error && albums.length > 0 && (
        <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
          <CollectionGrid
            items={albums}
            renderItem={(album) => (
              <AlbumCard album={album} onSelect={handleSelectAlbum} />
            )}
          />
        </div>
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
