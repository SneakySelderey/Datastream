import React, { useState, useRef, useEffect } from 'react';

import { usePlayer } from '../context/PlayerContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

import PlayIcon from '../assets/play.svg?react';
import PauseIcon from '../assets/pause.svg?react';
import VolumeIcon from '../assets/volume-full.svg?react';
import SkipBackwardIcon from '../assets/skip-backward.svg?react';
import SkipForwardIcon from '../assets/skip-forward.svg?react';
import PlaylistsIcon from '../assets/playlists.svg?react';

import PlayQueue from './PlayQueue';

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Player: React.FC = () => {
  const { currentTrack, isPlaying, queue, togglePlay, setTrack } = usePlayer();

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useLocalStorage<number>('player-volume', 0.5);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < queue.length - 1;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Playback error:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePrev = () => {
    if (hasPrev) {
      setTrack(queue[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setTrack(queue[currentIndex + 1]);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };
  
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-accent text-fg z-50 transition-colors duration-300 ease-in-out">
      {isQueueOpen && (
        <PlayQueue 
          queue={queue}
          currentTrack={currentTrack}
          onPlayTrack={setTrack}
          onClose={() => setIsQueueOpen(false)}
        />
      )}
      
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
            if (hasNext) handleNext();
            else togglePlay();
        }}
      />
      
      <div className="flex items-center gap-5">
        <img src={currentTrack.cover} alt={currentTrack.title} className="w-16 h-16 rounded hidden md:block" />

        <div className='flex-col w-full truncate'>
          <div>
            <p className="font-bold">{currentTrack.title}</p>
            <p>{currentTrack.artist}</p>
          </div>
          
          <div className="w-full flex items-center gap-2">
            <span className="text-sm text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        <button onClick={() => setIsQueueOpen(!isQueueOpen)} title="Play Queue">
          <PlaylistsIcon className='w-8 h-8 cursor-pointer fill-current'/>
        </button>

        <button onClick={handlePrev} disabled={!hasPrev}>
          <SkipBackwardIcon className='w-8 h-8 cursor-pointer fill-current'/>
        </button>

        <button onClick={togglePlay}>
          {isPlaying ? (
            <PauseIcon className='w-6 h-6 cursor-pointer fill-current'/>
          ) : (
            <PlayIcon className='w-6 h-6 cursor-pointer fill-current'/>
          )}
        </button>

        <button onClick={handleNext} disabled={!hasNext}>
          <SkipForwardIcon className='w-8 h-8 cursor-pointer fill-current'/>
        </button>

        <div className='hidden md:flex items-center gap-2'>
          <VolumeIcon className="w-6 h-6 fill-current" />
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
