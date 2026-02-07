export type Theme = 'light' | 'dark';
export type ScanStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface ScanProgress {
  status: ScanStatus;
  foldersScanned: number;
  totalFolders: number;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface LastRescanInfo {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalFolders: number;
}

export interface Track {
  id: string;
  title: string;
  number?: number | null;
  totalNumber?: number | null;
  discNumber: number;
  date?: string | null;
  duration: number;
  bitrate: number;
  size: number;
  filePath: string;
  fileName: string;
  format: string;
  replayGainTrack?: number | null;
  replayGainAlbum?: number | null;
  replayPeakTrack?: number | null;
  replayPeakAlbum?: number | null;
  albumId?: string | null;
  album?: Album | null;
  coverPath?: string | null;
  artists?: Artist[];
  genres?: Genre[];
  playlists?: Playlist[];
  createdAt: string;
  updatedAt: string;
  plays: number;
}

export interface Genre {
  id: string;
  name: string;
  tracks?: Track[];
}

export interface Album {
  id: string;
  title: string;
  date?: string | null;
  coverPath?: string | null;
  createdAt: string;
  artists?: Artist[];
  tracks?: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  userId: string;
  user?: User;
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  createdAt: string;
  albums?: Album[];
  tracks?: Track[];
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistListItem {
  id: string;
  name: string;
  albumCount: number;
  songCount: number;
  size: number;
  plays: number;
}

export interface PlaylistListItem extends Playlist {
  _count: {
    tracks: number;
  };
  tracks: Track[];
}

export interface FilterState {
  search: string;
  genre: string;
  year: string;
}

export type OrderMode = 'default' | 'random' | 'recently-added' | 'recently-played' | 'most-played';

export const formatTime = (timeInSeconds: number): string => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';

  const totalSeconds = Math.floor(timeInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || isNaN(bytes)) return '0 MB';

  const gb = 1024 ** 3;
  const mb = 1024 ** 2;

  if (bytes >= gb) {
    return `${(bytes / gb).toFixed(2)} GB`;
  }

  return `${(bytes / mb).toFixed(2)} MB`;
};

export const buildCoverUrl = (coverPath?: string | null): string | null => {
  if (!coverPath) return null;
  return `/stream/cover/${coverPath}`;
};

export const buildTrackUrl = (trackId: string): string => `/stream/track/${trackId}`;

export interface AuthResponse {
  access_token: string;
  user: User;
}
