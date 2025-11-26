export type Theme = 'light' | 'dark';

export interface Track {
  id: number;
  trackNumber: number;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
  duration: string;
  quality: string;
  plays: number;
  size: string;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  date: string;
  genres: string[];
  tracklist: Track[];
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