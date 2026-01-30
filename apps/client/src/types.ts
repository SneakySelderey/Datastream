export type Theme = 'light' | 'dark';

export interface Track {
  id: string;
  number: number;
  totalNumber: number;
  discNumber: number;
  title: string;
  artists: Artist[];
  artistId: string;
  album: Album;
  albumId: string;
  date: string;
  filepath: string;
  coverPath: string;
  duration: string;
  format: string;
  plays: number;
  size: number;
  bitrate: number;
  genres: Genre[];
}

export interface Genre {
  id: string;
  name: string;
}

export interface Album {
  id: string;
  title: string;
  artists: Artist[];
  artistId: string;
  cover: string;
  date: string;
  genres: Genre[];
  tracks: Track[];
  trackCount: number;
  duration: string;
  size: number;
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
  albums: Album[];
  tracks: Track[];
  albumCount: number;
  songCount: number;
  size: number;
  plays: number;
}

export const formatTime = (timeInSeconds: number): string => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export interface User {
  id: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}