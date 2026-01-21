import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { usePlaylists } from '../hooks/usePlaylists';
import { useLocalStorage } from '../hooks/useLocalStorage';

import AlbumGrid from '../components/AlbumGrid';
import PaginationControls from '../components/PaginationControls';

import { type Album } from '../types';

const PlaylistsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>('playlistsPerPage', 18);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  const { playlists, total, isLoading, error } = usePlaylists(currentPage, itemsPerPage, search);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    
    setSearchParams(params, { replace: true });
  }, [search, setSearchParams]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleSelectPlaylist = (playlist: Album) => {
    navigate(`/playlists/${playlist.id}`);
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
        <AlbumGrid
          albums={playlists} 
          onSelectAlbum={handleSelectPlaylist}
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

export default PlaylistsPage;
