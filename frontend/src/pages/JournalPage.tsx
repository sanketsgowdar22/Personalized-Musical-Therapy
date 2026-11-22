import { useState } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Loader2, Play, Music, PenTool } from 'lucide-react';

export const JournalPage = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<EmotionDetection | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const { setQueue, playTrack } = usePlayerStore();

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const { data: detectionData } = await api.post('/emotions/detect/text', { text });
      setDetectionResult(detectionData);

      const { data: recData } = await api.get('/music/recommendations', {
        params: { emotion: detectionData.primary_emotion, limit: 5 },
      });
      setRecommendation(recData);
    } catch (error) {
      console.error("Journal analysis failed:", error);
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
          Therapeutic <span className="gradient-text">Journal</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Write down your thoughts. Our AI will analyze your sentiment and prescribe healing music.
        </p>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Editor Section */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <PenTool size={20} />
            <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>How are you feeling today?</h3>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Let it all out... the space is yours."
              style={{
                width: '100%',
                minHeight: '350px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.3s, background 0.3s'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(0,0,0,0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'rgba(0,0,0,0.15)'; }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {text.length} characters
            </span>
            <motion.button
              whileHover={(!text.trim() || isProcessing) ? {} : { scale: 1.02 }}
              whileTap={(!text.trim() || isProcessing) ? {} : { scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!text.trim() || isProcessing}
              className="btn-primary"
              style={{
                padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                opacity: (!text.trim() || isProcessing) ? 0.5 : 1,
              }}
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={18} /> Analyzing Sentiment...</>
              ) : (
                <><Sparkles size={18} /> Analyze & Prescribe</>
              )}
            </motion.button>
          </div>
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

                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sentiment Analysis</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getEmotionColor(detectionResult.primary_emotion)}40, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
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
                        {(detectionResult.confidence * 100).toFixed(1)}% Match
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Curated Playlist</h3>
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
                    <Play size={16} fill="currentColor" /> Play All
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
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{track.artist_name}</p>
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
