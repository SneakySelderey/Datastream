export type Theme = 'light' | 'dark';

export interface Track {
  id: string;
  trackNumber: number;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  src: string;
  cover: string;
  duration: string;
  format: string;
  plays: number;
  size: number;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  cover: string;
  date: string;
  genres: string[];
  tracks: Track[];
  trackCount: number;
  duration: string;
  size: string;
}

export interface FilterState {
  search: string;
  genre: string;
  year: string;
}

export type SortMode = 'default' | 'random' | 'recently-added' | 'recently-played' | 'most-played';

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  songCount: number;
  size: string;
  plays: number;
}

export const formatTime = (timeInSeconds: number): string => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
