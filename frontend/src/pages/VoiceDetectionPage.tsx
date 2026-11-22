import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Play, Music, Sparkles } from 'lucide-react';

export const VoiceDetectionPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [detectionResult, setDetectionResult] = useState<EmotionDetection | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const { setQueue, playTrack } = usePlayerStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Simple visualizer state
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const animationRef = useRef<number>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup simple visualizer (mocked here for simplicity without AudioContext,
      // but in a real app you'd hook up an AnalyserNode)
      const mockVisualizer = () => {
        if (isRecording) {
          setAudioLevel(Math.random() * 0.5 + 0.5);
          animationRef.current = requestAnimationFrame(mockVisualizer);
        }
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setAudioLevel(0);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach(track => track.stop());
        await handleAnalyze(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDetectionResult(null);
      setRecommendation(null);
      mockVisualizer();

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setAudioLevel(0);
    }
  }, [isRecording]);

  const handleAnalyze = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const { data: detectionData } = await api.post('/emotions/detect/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(detectionData);

      const { data: recData } = await api.get('/music/recommendations', {
        params: { emotion: detectionData.primary_emotion, limit: 5 },
      });
      setRecommendation(recData);
    } catch (error) {
      console.error("Voice analysis failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playEntireQueue = () => {
    if (recommendation) {
      setQueue(recommendation.tracks);
    }
  };

  const getEmotionColor = (emotion: string) => `var(--emotion-${emotion.toLowerCase()})`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.header variants={itemVariants} style={{ marginBottom: '3rem', position: 'relative' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Vocal <span className="gradient-text">Analysis</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Speak your mind. We analyze pitch, tone, and cadence to determine your mood.
        </p>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Recorder Section */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>

          {isRecording && (
             <motion.div
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(244, 63, 94, 0.1)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }}
             />
          )}

          <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
            <motion.div
              animate={{
                scale: isRecording ? audioLevel * 1.1 : 1,
                boxShadow: isRecording ? `0 0 ${audioLevel * 40}px rgba(244, 63, 94, 0.5)` : '0 0 0px rgba(0,0,0,0)'
              }}
              style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: isRecording ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                border: isRecording ? '2px solid var(--accent-secondary)' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.3s, border 0.3s'
              }}
              onClick={isRecording ? stopRecording : startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRecording ? <Square size={40} color="var(--accent-secondary)" fill="currentColor" /> : <Mic size={48} color="var(--text-secondary)" />}
            </motion.div>
          </div>

          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: isRecording ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
              {isRecording ? 'Listening...' : 'Click to start recording'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {isProcessing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 className="animate-spin" size={16} /> Analyzing acoustic features...
                </span>
              ) : 'Speak naturally for at least 5 seconds.'}
            </p>
          </div>

          <AnimatePresence>
            {audioUrl && !isRecording && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                style={{ marginTop: '2rem', width: '100%', maxWidth: '300px', zIndex: 1 }}
              >
                <audio src={audioUrl} controls style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-full)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {detectionResult && (
              <motion.div
                key={`emotion-${detectionResult.primary_emotion}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', right: 0, top: 0, width: '150px', height: '150px', background: getEmotionColor(detectionResult.primary_emotion), filter: 'blur(80px)', zIndex: -1, opacity: 0.3 }} />

                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Vocal Analysis Result</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }}
                    style={{
                      width: '90px', height: '90px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getEmotionColor(detectionResult.primary_emotion)}40, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                      border: `1px solid ${getEmotionColor(detectionResult.primary_emotion)}80`,
                      boxShadow: `0 0 30px ${getEmotionColor(detectionResult.primary_emotion)}40`
                    }}
                  >
                    {detectionResult.primary_emotion === 'happy' ? '😊' :
                     detectionResult.primary_emotion === 'sad' ? '😢' :
                     detectionResult.primary_emotion === 'angry' ? '😠' :
                     detectionResult.primary_emotion === 'surprise' ? '😲' :
                     detectionResult.primary_emotion === 'fear' ? '😨' :
                     detectionResult.primary_emotion === 'disgust' ? '🤢' : '😐'}
                  </motion.div>
                  <div>
                    <p style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'capitalize', color: getEmotionColor(detectionResult.primary_emotion), marginBottom: '0.25rem' }}>
                      {detectionResult.primary_emotion}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getEmotionColor(detectionResult.primary_emotion) }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {(detectionResult.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {recommendation && (
              <motion.div
                key="recommendation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-panel"
                style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', flex: 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Therapeutic Playlist</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Strategy: <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>{recommendation.strategy.replace('_', ' ').toUpperCase()}</span>
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={playEntireQueue}
                    style={{
                      padding: '0.75rem 1.25rem', background: 'var(--accent-gradient)', color: 'white',
                      borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                      boxShadow: 'var(--shadow-glow)'
                    }}
                  >
                    <Play size={16} fill="currentColor" /> Play Session
                  </motion.button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recommendation.tracks.map((track, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                      key={track.id}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '1rem',
                        background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)', transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        <Music size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{track.track_name}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{track.artist_name} • {track.genre}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => playTrack(track)}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                          color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
