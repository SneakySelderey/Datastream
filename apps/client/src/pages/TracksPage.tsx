import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useTracks } from '../hooks/useTracks';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePlayer } from '../context/PlayerContext';

import Tracklist from '../components/Tracklist/Tracklist';
import PaginationControls from '../components/PaginationControls';
import Filters from '../components/Filters';

import { type FilterState, type OrderMode } from '../types';

const TracksPage = () => {
  const { playTrack } = usePlayer();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('tracksPerPage', 18);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
  });
  
  const debouncedSearch = useDebouncedValue(filters.search);
  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const orderMode = (searchParams.get('order') as OrderMode) || 'default';

  const { tracks, total, isLoading, error, availableGenres, availableYears } = useTracks(
    currentPage,
    itemsPerPage,
    effectiveFilters,
    orderMode,
  );

  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (orderMode && orderMode !== 'default') params.order = orderMode;

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

  return (
    <div className='m-5 relative'>    
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

      {!error && tracks.length > 0 && (
        <div className={`mt-5 transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
          <Tracklist
            tracks={tracks} 
            onPlayTrack={playTrack}
            showAlbum={true}
            selectedIds={selectedTrackIds}
            onSelectionChange={setSelectedTrackIds}
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

export default TracksPage;
