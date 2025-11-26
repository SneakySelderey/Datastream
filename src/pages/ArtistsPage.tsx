import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useArtists } from '../hooks/useArtists';
import { useLocalStorage } from '../hooks/useLocalStorage';

import ArtistList from '../components/ArtistList';
import PaginationControls from '../components/PaginationControls';

import { type Artist, type SortMode } from '../types';

const ArtistsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('artistsPerPage', 20);

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const sortMode = (searchParams.get('sort') as SortMode) || 'default';
  
  const { artists, total, isLoading, error } = useArtists(currentPage, itemsPerPage, search, sortMode);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (sortMode && sortMode !== 'default') params.sort = sortMode;
    if (search) params.search = search;
    
    setSearchParams(params, { replace: true });
  }, [search, sortMode, setSearchParams]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSelectArtist = (artist: Artist) => {
    navigate(`/artists/${artist.id}`);
  };

  return (
    <div className='m-5'>    
      {isLoading && <p>{t('loading')}</p>}
      {error && <p>{error}</p>}

      <div className="w-full md:w-96 mb-5">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-bg border border-fg/20 rounded-lg focus:outline-none focus:border-fg focus:ring-1 focus:ring-fg/20 transition-all"
        />
      </div>

      {!isLoading && !error && (
        <div className="mt-5">
          <ArtistList
            artists={artists} 
            onSelectArtist={handleSelectArtist}
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

export default ArtistsPage;