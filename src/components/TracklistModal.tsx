import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaylists } from '../hooks/usePlaylists';
import Dropdown from './Dropdown';

interface TracklistModalProps {
  onClose: () => void;
  onConfirm: (playlistId: string) => void;
  trackCount: number;
}

export const TracklistModal: React.FC<TracklistModalProps> = ({ 
  onClose, 
  onConfirm,
  trackCount 
}) => {
  const { t } = useTranslation();
  
  const { playlists, isLoading } = usePlaylists(1, 1000, '');
  
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  const options = useMemo(() => {
    return playlists.map(p => p.title);
  }, [playlists]);

  const handleConfirm = () => {
    const selectedPlaylist = playlists.find(p => p.title === selectedTitle);
    
    if (selectedPlaylist) {
      onConfirm(selectedPlaylist.id);
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
            {t('addingTracksMessage', `Adding ${trackCount} tracks to...`)}
          </p>
        </div>

        <div className="w-full">
          {isLoading ? (
             <div className="h-10 w-full bg-fg/5 rounded-lg" />
          ) : (
            <Dropdown 
              options={options}
              selected={selectedTitle}
              placeholder={t('selectPlaylist')}
              onSelect={setSelectedTitle}
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
            onClick={handleConfirm}
            disabled={!selectedTitle}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TracklistModal;
