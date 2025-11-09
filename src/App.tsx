import { useState } from 'react'

import Player from './components/Player';

import { type Track } from './types';

const trackList = [
  { id: 1, title: 'Synthwave Dreams', artist: 'Cyber Runner', src: '/music/song1.mp3', cover: '/covers/cover1.jpg' },
  { id: 2, title: 'Ocean Drive', artist: 'Night Rider', src: '/music/song2.mp3', cover: '/covers/cover2.jpg' },
];

function App() {
  const [currentTrack, setCurrentTrack] = useState(trackList[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div>
      <Player 
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlayPause}
      />
    </div>
  )
}

export default App
