import React from 'react';
import { useTranslation } from 'react-i18next';

import { type Track } from '../types';

import CloseIcon from '../assets/close.svg?react';

interface PlayQueueProps {
  queue: Track[];
  currentTrack: Track;
  onPlayTrack: (track: Track) => void;
  onClose: () => void;
}

const PlayQueue: React.FC<PlayQueueProps> = ({ queue, currentTrack, onPlayTrack, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-full right-0 mr-4 mb-2 md:w-100 border bg-bg border-fg/10 rounded-xl z-50 flex flex-col
                    transition-colors duration-300 ease-in-out">
      
      <div className="p-3 border-b border-fg/10 flex justify-between items-center">
        <h3 className="text-sm">{t('playQueue')}</h3>

        <button
          onClick={onClose}
          className="p-1 hover:bg-fg/10 rounded-full transition-colors"
          title="Close queue"
        >
          <CloseIcon className="w-5 h-5 fill-current" />
        </button>
      </div>

      <ul className="flex flex-col p-2">
        {(queue.map((qTrack) => {
            const isCurrent = currentTrack.id === qTrack.id;

            return (
              <li
                key={`${qTrack.id}`}
                onClick={() => onPlayTrack(qTrack)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm
                            ${isCurrent ? 'bg-fg/10' : 'hover:bg-fg/5'}`}
              >

                <div className="flex flex-col overflow-hidden">
                  <span className="truncate">{qTrack.title}</span>
                  <span className="truncate text-xs">{qTrack.artist}</span>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default PlayQueue;
