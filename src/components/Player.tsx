import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { type Track } from '../types';

import PlayIcon from '../assets/play.svg?react';
import PauseIcon from '../assets/pause.svg?react';

const dummyTrack: Track = {
  id: 1,
  title: 'Synthwave Dreams',
  artist: 'Cyber Runner',
  src: '/music/song1.mp3',
  cover: '/covers/cover1.jpg',
};

interface PlayerProps {}

const Player: React.FC<PlayerProps> = () => {
  const { t } = useTranslation();

  const [track, setTrack] = useState<Track>(dummyTrack);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

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

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };
  
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-5 bg-gray-200 text-black z-50">
      <audio
        ref={audioRef}
        src={track?.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center gap-20">
        <img src={track.cover} alt={track.title} className="w-14 h-14 rounded" />
        <div>
          <p className="font-bold">{track.title}</p>
          <p className="text-gray-400">{track.artist}</p>
        </div>

        <button onClick={togglePlayPause} className="">
          {isPlaying ? (
            <PauseIcon className='w-6 h-6'/>
          ) : (
            <PlayIcon className='w-6 h-6'/>
          )}
        </button>
        {/* ProgressBar */}

        <p>Volume</p>
      </div>
    </div>
  );
};

export default Player;