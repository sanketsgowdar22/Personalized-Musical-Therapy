import { create } from 'zustand';

export interface Track {
  id: string;
  track_name: string;
  artist_name: string;
  album_image_url?: string;
  preview_url?: string;
  duration_ms?: number;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  
  // Actions
  playTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  
  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  
  setQueue: (tracks) => {
    if (tracks.length > 0) {
      set({ queue: tracks, currentTrack: tracks[0], isPlaying: true });
    } else {
      set({ queue: [], currentTrack: null, isPlaying: false });
    }
  },
  
  playNext: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < queue.length - 1) {
      set({ currentTrack: queue[currentIndex + 1], isPlaying: true });
    } else {
      // Loop or stop
      set({ isPlaying: false });
    }
  },
  
  playPrevious: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      set({ currentTrack: queue[currentIndex - 1], isPlaying: true });
    }
  },
  
  togglePlayPause: () => set((state) => {
    if (!state.currentTrack) return state;
    return { isPlaying: !state.isPlaying };
  }),
  
  setVolume: (volume) => set({ volume }),
}));
