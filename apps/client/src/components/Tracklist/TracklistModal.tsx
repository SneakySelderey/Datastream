import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaylists } from '../../hooks/usePlaylists';
import { usePlaylistActions } from '../../hooks/usePlaylistActions';
import Dropdown from '../Dropdown';

interface TracklistModalProps {
  onClose: () => void;
  onSuccess: () => void;
  trackIds: string[];
}

export const TracklistModal: React.FC<TracklistModalProps> = ({ 
  onClose, 
  onSuccess,
  trackIds 
}) => {
  const { t } = useTranslation();
  
  const { playlists, isLoading, createPlaylist } = usePlaylists(1, 1000, '');
  const { addTracksToPlaylist } = usePlaylistActions();

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const didInitMode = useRef(false);

  const options = useMemo(() => {
    return [...playlists]
      .map(p => p.title);
  }, [playlists]);

  const hasPlaylists = options.length > 0;

  useEffect(() => {
    if (!didInitMode.current && !isLoading) {
      if (!hasPlaylists) {
        setMode('create');
        setSelectedTitle('');
      } else {
        setMode('select');
      }
      didInitMode.current = true;
    }

    if (mode === 'select' && !selectedTitle && options.length > 0) {
      setSelectedTitle(options[0]);
    }
  }, [mode, selectedTitle, options, hasPlaylists, isLoading]);

  const handleSubmit = async () => {
    try {
      let targetPlaylistId = '';

      if (mode === 'select') {
        const playlist = playlists.find(p => p.title === selectedTitle);
        if (!playlist) return;
        targetPlaylistId = playlist.id;
      } else {
        targetPlaylistId = await createPlaylist(newPlaylistTitle);
      }

      await addTracksToPlaylist(targetPlaylistId, trackIds);

      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert(t('errorAddingTracks'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-bg rounded-xl flex flex-col p-6 gap-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3 className="text-xl">{t('addToPlaylist')}</h3>
          <p className="text-sm">
            {t('addingTracksMessage', { count: trackIds.length })}
          </p>
        </div>

        <div className="flex gap-4 text-sm border-b border-fg/10 pb-2">
          <button 
            onClick={() => setMode('select')}
            disabled={!hasPlaylists}
            className={`pb-1 ${mode === 'select' ? 'border-b-2 border-primary font-bold' : 'opacity-50'} ${!hasPlaylists ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {t('selectExisting')}
          </button>
          <button 
            onClick={() => setMode('create')}
            className={`pb-1 ${mode === 'create' ? 'border-b-2 border-primary font-bold' : 'opacity-50'}`}
          >
            {t('createNew')}
          </button>
        </div>

        <div className="w-full">
          {isLoading ? (
             <div className="h-10 w-full bg-fg/5 rounded-lg animate-pulse" />
          ) : mode === 'select' ? (
            <Dropdown 
              options={options}
              selected={selectedTitle}
              placeholder={t('selectPlaylist')}
              onSelect={setSelectedTitle}
            />
          ) : (
            <input
              type="text"
              autoFocus
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              placeholder={t('playlistName')}
              className="w-full px-4 py-2 bg-bg border border-fg/20 rounded-lg focus:outline-none focus:border-fg"
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-fg/5 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={mode === 'select' ? !selectedTitle : !newPlaylistTitle}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-fg/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TracklistModal;
