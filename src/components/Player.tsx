import React, { useState, useRef, useEffect } from 'react';

import { type Track } from '../types';

import PlayIcon from '../assets/play.svg?react';
import PauseIcon from '../assets/pause.svg?react';
import VolumeIcon from '../assets/volume-full.svg?react';

interface PlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const Player: React.FC<PlayerProps> = ({ track, isPlaying, onTogglePlay }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Playback error:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-gray-200 text-black z-50">
      <audio
        ref={audioRef}
        src={track?.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onTogglePlay}
      />
      
      <div className="flex items-center gap-5">
        <img src={track.cover} alt={track.title} className="w-16 h-16 rounded" />
        <div>
          <p className="font-bold">{track.title}</p>
          <p className="text-gray-400">{track.artist}</p>
        </div>

        <button onClick={onTogglePlay} className="">
          {isPlaying ? (
            <PauseIcon className='w-6 h-6'/>
          ) : (
            <PlayIcon className='w-6 h-6'/>
          )}
        </button>
        {/* ProgressBar */}

        <div className='flex items-center gap-2'>
          <VolumeIcon className="w-6 h-6 text-gray-600" />
          
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