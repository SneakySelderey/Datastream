import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { useTracks } from '../hooks/useTracks';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePlayer } from '../context/PlayerContext';

import Tracklist from '../components/Tracklist';
import PaginationControls from '../components/PaginationControls';
import Filters from '../components/Filters';

import { type FilterState, type SortMode } from '../types';

const TracksPage = () => {
  const { t } = useTranslation();
  const { playTrack } = usePlayer();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('tracksPerPage', 18);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
  });

  const sortMode = (searchParams.get('sort') as SortMode) || 'default';
  
  const { tracks, total, isLoading, error, availableGenres, availableYears } = useTracks(currentPage, itemsPerPage, filters, sortMode);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (sortMode && sortMode !== 'default') params.sort = sortMode;

    if (filters.genre) params.genre = filters.genre;
    if (filters.search) params.search = filters.search;
    if (filters.year) params.year = filters.year;
    
    setSearchParams(params, { replace: true });
  }, [filters, sortMode, setSearchParams]);

  const handleSortChange = (newSort: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', newSort);
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
    <div className='m-5'>    
      {isLoading && <p>{t('loading')}</p>}

      {error && <p>{error}</p>}

      <Filters 
        search={filters.search}
        genre={filters.genre}
        year={filters.year}
        genres={availableGenres}
        years={availableYears}
        sortMode={sortMode}
        onSearchChange={handleSearchChange}
        onGenreChange={handleGenreChange}
        onYearChange={handleYearChange}
        onSortChange={handleSortChange}
      />

      {!isLoading && !error && (
        <div className="mt-5">
          <Tracklist
            tracks={tracks} 
            onPlayTrack={playTrack}
            showAlbum={true}
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
