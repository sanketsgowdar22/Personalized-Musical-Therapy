import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';

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
    <div 
      className="glass"
      style={{
        position: 'fixed',
        bottom: '0',
        left: '280px', // Offset for sidebar (assuming sidebar is 280px or adjust dynamically)
        right: '0',
        height: '90px',
        borderTop: '1px solid var(--border)',
        borderBottom: 'none',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        padding: '0 var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: '30%' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {currentTrack.album_image_url ? (
            <img src={currentTrack.album_image_url} alt="Album" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>🎵</span>
          )}
        </div>
        <div>
          <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', margin: 0 }}>{currentTrack.track_name}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{currentTrack.artist_name}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
          <button onClick={playPrevious} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            ⏮️
          </button>
          
          <button 
            onClick={togglePlayPause} 
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'white', color: 'black', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <button onClick={playNext} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            ⏭️
          </button>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input 
            type="range" 
            min="0" max="100" value={progress} 
            onChange={seek}
            style={{ width: '100%', height: '4px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Volume */}
      <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>🔊</span>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{ width: '100px', height: '4px', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      {/* Hidden Audio Element */}
      {/* In Phase 09, we might use a mock stream URL if preview_url is null */}
      <audio 
        ref={audioRef}
        src={currentTrack.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};
