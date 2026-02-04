import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { usePlayer } from '../../context/PlayerContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import PlayIcon from '../../assets/play.svg?react';
import PauseIcon from '../../assets/pause.svg?react';
import VolumeIcon from '../../assets/volume-full.svg?react';
import SkipBackwardIcon from '../../assets/skip-backward.svg?react';
import SkipForwardIcon from '../../assets/skip-forward.svg?react';
import PlaylistsIcon from '../../assets/playlists.svg?react';

import PlayQueue from './PlayQueue';
import { buildCoverUrl, buildTrackUrl, formatTime } from '../../types';

const Player: React.FC = () => {
  const { currentTrack, isPlaying, queue, togglePlay, setTrack, setTrackPlays } = usePlayer();

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

  const handleTrackEnded = async () => {
    if (currentTrack.id && currentTrack.id !== '0') {
      try {
        const response = await fetch(`/api/tracks/${currentTrack.id}/plays`, { method: 'POST' });
        if (response.ok) {
          const payload = await response.json();
          
          setTrackPlays(payload.trackId, payload.plays);
        }
      } catch (e) {
        console.error('Failed to increment play count', e);
      }
    }

    if (hasNext) handleNext();
    else togglePlay();
  };
  
  const clampedCurrentTime =
    duration > 0 ? Math.min(Math.max(currentTime, 0), duration) : 0;

  const progress =
    duration > 0
      ? Math.min(100, Math.max(0, (clampedCurrentTime / duration) * 100))
      : 0;
  const volumeProgress = Math.min(100, Math.max(0, volume * 100));
    
  if (!currentTrack) return null;

  const artistName = currentTrack.artists?.[0]?.name ?? '—';
  const albumTitle = currentTrack.album?.title ?? '—';
  const coverUrl = buildCoverUrl(currentTrack.coverPath);

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
        src={buildTrackUrl(currentTrack.id)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      <div className="flex items-center gap-5">
        <img src={coverUrl ?? ''} alt={currentTrack.title} className="w-16 h-16 rounded hidden md:block" />

        <div className='flex-col w-full truncate'>
          <div>
            <p className="font-bold">{currentTrack.title}</p>

            <div className="truncate">
              {currentTrack.artists?.[0]?.id ? (
                <Link
                  to={`/artists/${currentTrack.artists[0].id}`}
                  className="text-link hover:underline hover:text-primary transition-colors"
                >
                  {artistName}
                </Link>
              ) : (
                <span className="text-fg/70">{artistName}</span>
              )}
              <span className="mx-1">&bull;</span>
              {currentTrack.albumId ? (
                <Link 
                  to={`/albums/${currentTrack.albumId}`}
                  className="text-link hover:underline hover:text-primary transition-colors"
                >
                  {albumTitle}
                </Link>
              ) : (
                <span className="text-fg/70">{albumTitle}</span>
              )}
            </div>
          </div>

          <div className="w-full flex items-center gap-2">
            <span className="text-sm text-right">{formatTime(currentTime)}</span>
            
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={clampedCurrentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                #3b82f6 0%,
                #3b82f6 ${progress}%,
                #9ca3af ${progress}%,
                #9ca3af 100%
                )`,
              }}
              />

            <span className="text-sm w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        <button onClick={() => setIsQueueOpen(!isQueueOpen)} title="Play Queue">
          <PlaylistsIcon className='w-8 h-8 cursor-pointer fill-current' />
        </button>

        <button onClick={handlePrev} disabled={!hasPrev}>
          <SkipBackwardIcon className='w-8 h-8 cursor-pointer fill-current' />
        </button>

        <button onClick={togglePlay}>
          {isPlaying ? (
            <PauseIcon className='w-6 h-6 cursor-pointer fill-current' />
          ) : (
            <PlayIcon className='w-6 h-6 cursor-pointer fill-current' />
          )}
        </button>

        <button onClick={handleNext} disabled={!hasNext}>
          <SkipForwardIcon className='w-8 h-8 cursor-pointer fill-current' />
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
            style={{
              background: `linear-gradient(to right,
              #3b82f6 0%,
              #3b82f6 ${volumeProgress}%,
              #9ca3af ${volumeProgress}%,
              #9ca3af 100%
              )`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
