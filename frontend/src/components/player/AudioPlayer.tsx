import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Volume1, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export const AudioPlayer = () => {
  const { currentTrack, isPlaying, volume, togglePlayPause, playNext, playPrevious, setVolume } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle Play/Pause side-effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Handle Time Update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const value = parseFloat(e.target.value);
      const newTime = (value / 100) * (audioRef.current.duration || 0);
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '0',
        left: 'var(--sidebar-width)',
        right: '0',
        height: '100px',
        borderBottom: 'none',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
      }}
    >
      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '30%' }}>
        <motion.div
          animate={{ scale: isPlaying ? 1.05 : 1, rotate: isPlaying ? [0, 2, -2, 0] : 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '64px', height: '64px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: isPlaying ? 'var(--shadow-glow)' : 'none',
            border: '1px solid var(--border)'
          }}
        >
          {currentTrack.album_image_url ? (
            <img src={currentTrack.album_image_url} alt="Album" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Music size={24} color="var(--text-muted)" />
          )}
        </motion.div>
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{currentTrack.track_name}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{currentTrack.artist_name}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playPrevious} style={{ color: 'var(--text-secondary)' }}>
            <SkipBack size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'white', color: 'black',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
            }}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={playNext} style={{ color: 'var(--text-secondary)' }}>
            <SkipForward size={24} />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
            {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
          </span>
          <input
            type="range"
            min="0" max="100" value={progress || 0}
            onChange={seek}
            style={{
              width: '100%', height: '4px',
              accentColor: 'var(--accent-primary)',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px' }}>
            {audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {volume === 0 ? <VolumeX size={20} color="var(--text-secondary)" /> : volume < 0.5 ? <Volume1 size={20} color="var(--text-secondary)" /> : <Volume2 size={20} color="var(--text-secondary)" />}
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: '100px', height: '4px', accentColor: 'var(--text-primary)', cursor: 'pointer' }}
        />
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />
    </motion.div>
  );
};

// Helper for MM:SS
function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
