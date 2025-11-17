export type Theme = 'light' | 'dark';

export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  cover: string;
}

export interface Album {
  id: number;
  title: string;
  artist: string;
  year: number;
  cover: string;
}