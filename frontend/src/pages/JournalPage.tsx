import { useState } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { usePlayerStore } from '../store/playerStore';

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
      // Send to Text Emotion Detection API
      const { data: detectionData } = await api.post('/emotions/detect/text', { text });
      setDetectionResult(detectionData);

      // Fetch recommendations based on text emotion
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

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Therapeutic Journal
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Write down your thoughts. Our AI will analyze your sentiment and prescribe healing music.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
        {/* Editor Section */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? Let it all out..."
            style={{
              width: '100%',
              minHeight: '300px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-md)',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isProcessing}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontWeight: 600,
              opacity: (!text.trim() || isProcessing) ? 0.5 : 1,
            }}
          >
            {isProcessing ? 'Analyzing Sentiment...' : 'Analyze & Prescribe Music'}
          </button>
        </div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {detectionResult && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Sentiment Result</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  background: getEmotionColor(detectionResult.primary_emotion),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: `0 0 20px ${getEmotionColor(detectionResult.primary_emotion)}40`,
                }}>
                  {detectionResult.primary_emotion === 'happy' ? '😊' :
                   detectionResult.primary_emotion === 'sad' ? '😢' :
                   detectionResult.primary_emotion === 'angry' ? '😠' :
                   detectionResult.primary_emotion === 'surprise' ? '😲' :
                   detectionResult.primary_emotion === 'fear' ? '😨' :
                   detectionResult.primary_emotion === 'disgust' ? '🤢' : '😐'}
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', textTransform: 'capitalize', color: getEmotionColor(detectionResult.primary_emotion) }}>
                    {detectionResult.primary_emotion}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Text Analysis Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {recommendation && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Prescribed Playlist</h3>
                <button
                  onClick={playEntireQueue}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  Play All
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recommendation.tracks.map((track) => (
                  <div key={track.id} style={{
                    display: 'flex', alignItems: 'center', padding: 'var(--space-3)',
                    background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{track.track_name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>{track.artist_name}</p>
                    </div>
                    <button 
                      onClick={() => playTrack(track)}
                      style={{
                        padding: 'var(--space-1) var(--space-3)',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--accent-primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600
                      }}
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
