import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io } from "socket.io-client";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  type LastRescanInfo,
  type ScanProgress,
  type ScanStatus,
  type Track,
} from "../types";

const defaultTrack: Track = {
  id: "0",
  title: "Select a track to play",
  discNumber: 1,
  duration: 0,
  bitrate: 0,
  size: 0,
  filePath: "",
  fileName: "",
  format: "",
  replayGainTrack: null,
  replayGainAlbum: null,
  replayPeakTrack: null,
  replayPeakAlbum: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  plays: 0,
  artists: [
    {
      id: "0",
      name: "...",
      createdAt: new Date(0).toISOString(),
    },
  ],
};

const defaultScanProgress: ScanProgress = {
  status: "idle",
  foldersScanned: 0,
  totalFolders: 0,
};

interface PlayerContextType {
  currentTrack: Track;
  isPlaying: boolean;
  queue: Track[];
  currentQueueIndex: number;
  playCounts: Record<string, number>;
  libraryVersion: number;
  scanProgress: ScanProgress;
  lastRescanInfo: LastRescanInfo | null;
  playTrack: (track: Track, newQueue: Track[], startIndex?: number) => void;
  addTracks: (addQueue: Track[]) => void;
  addTracksNext: (addQueue: Track[]) => void;
  setTrack: (track: Track, queueIndex: number) => void;
  removeTrackFromQueue: (queueIndex: number) => void;
  setTrackPlays: (trackId: string, plays: number) => void;
  bumpLibraryVersion: () => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useLocalStorage<Track[]>("player-queue", []);
  const [currentTrack, setCurrentTrack] = useLocalStorage<Track>(
    "player-current-track",
    defaultTrack,
  );
  const [currentQueueIndex, setCurrentQueueIndex] = useLocalStorage<number>(
    "player-queue-index",
    0,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [scanProgress, setScanProgress] =
    useState<ScanProgress>(defaultScanProgress);
  const [lastRescanInfo, setLastRescanInfo] =
    useLocalStorage<LastRescanInfo | null>("last-rescan-info", null);
  const lastScanStatusRef = useRef<ScanStatus>("idle");

  useEffect(() => {
    const socket = io("/scanner", {
      path: "/socket.io",
      withCredentials: true,
    });

    socket.on("scan.progress", (payload: ScanProgress) => {
      setScanProgress(payload);

      if (
        payload.status === "completed" &&
        payload.startedAt &&
        payload.finishedAt
      ) {
        const startedTs = new Date(payload.startedAt).getTime();
        const finishedTs = new Date(payload.finishedAt).getTime();
        const durationMs =
          Number.isFinite(startedTs) && Number.isFinite(finishedTs)
            ? Math.max(0, finishedTs - startedTs)
            : 0;

        setLastRescanInfo({
          startedAt: payload.startedAt,
          finishedAt: payload.finishedAt,
          durationMs,
          totalFolders: payload.totalFolders,
        });
      }

      const previousStatus = lastScanStatusRef.current;
      if (previousStatus !== "completed" && payload.status === "completed") {
        setLibraryVersion((prev) => prev + 1);
      }

      lastScanStatusRef.current = payload.status;
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const playTrack = (track: Track, newQueue: Track[], startIndex?: number) => {
    setQueue(newQueue);
    setCurrentTrack(track);
    setCurrentQueueIndex(startIndex || 0);
    setIsPlaying(true);
  };

  const addTracks = (addQueue: Track[]) => {
    setQueue((prev) => [...prev, ...addQueue]);
  };

  const addTracksNext = (addQueue: Track[]) => {
    setQueue((prev) => {
      const insertIndex =
        currentQueueIndex >= 0 ? currentQueueIndex + 1 : prev.length;

      return [
        ...prev.slice(0, insertIndex),
        ...addQueue,
        ...prev.slice(insertIndex),
      ];
    });
  };

  const setTrack = (track: Track, queueIndex: number) => {
    setCurrentTrack(track);
    setCurrentQueueIndex(queueIndex);
    setIsPlaying(true);
  };

  const removeTrackFromQueue = (queueIndex: number) => {
    setQueue((prev) => {
      if (queueIndex < 0 || queueIndex >= prev.length) return prev;

      const nextQueue = prev.filter((_, index) => index !== queueIndex);

      if (queueIndex < currentQueueIndex) {
        setCurrentQueueIndex(currentQueueIndex - 1);
        return nextQueue;
      }

      if (queueIndex === currentQueueIndex) {
        if (nextQueue.length === 0) {
          setCurrentTrack(defaultTrack);
          setCurrentQueueIndex(0);
          setIsPlaying(false);
          return nextQueue;
        }

        const nextIndex = Math.min(currentQueueIndex, nextQueue.length - 1);
        setCurrentQueueIndex(nextIndex);
        setCurrentTrack(nextQueue[nextIndex]);
        return nextQueue;
      }

      return nextQueue;
    });
  };

  const setTrackPlays = (trackId: string, plays: number) => {
    setPlayCounts((prev) => ({
      ...prev,
      [trackId]: plays,
    }));
  };

  const bumpLibraryVersion = () => {
    setLibraryVersion((prev) => prev + 1);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        currentQueueIndex,
        playCounts,
        libraryVersion,
        scanProgress,
        lastRescanInfo,
        playTrack,
        addTracks,
        addTracksNext,
        setTrack,
        removeTrackFromQueue,
        setTrackPlays,
        bumpLibraryVersion,
        togglePlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
