import { useState } from 'react'

import Player from './components/Player';

import { type Track } from './types';

const trackList = [
  { id: 1, title: '01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27)', artist: '1000 Eyes', src: '/music/01 Schwanengesang, D. 957_ IV. Ständchen (v0.10.27).flac', cover: '/covers/cover.png' },
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
