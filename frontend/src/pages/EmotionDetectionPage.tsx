import { useState, useRef } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';

export const EmotionDetectionPage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<EmotionDetection | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setRecommendation(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // 1. Detect Emotion
      const { data: detectionData } = await api.post('/emotions/detect/face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(detectionData);

      // 2. Fetch Music Recommendations based on detected emotion
      const { data: recData } = await api.get('/music/recommendations', {
        params: { emotion: detectionData.primary_emotion, limit: 5 },
      });
      setRecommendation(recData);
      
    } catch (error) {
      console.error("Emotion detection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    return `var(--emotion-${emotion.toLowerCase()})`;
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Facial Emotion Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upload a photo to detect your emotion and get a personalized music prescription.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
        {/* Upload Section */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <div 
            style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-8)', 
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 'var(--space-4)',
              background: 'rgba(255,255,255,0.02)'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '300px', margin: '0 auto', borderRadius: 'var(--radius-md)' }} />
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>📸</div>
                <p style={{ color: 'var(--text-secondary)' }}>Click to upload an image</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedImage || isProcessing}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontWeight: 600,
              opacity: (!selectedImage || isProcessing) ? 0.5 : 1,
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            {isProcessing ? 'Analyzing Emotion...' : 'Detect Emotion & Get Music'}
          </button>
        </div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {detectionResult && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Analysis Result</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: '80px', height: '80px',
                  borderRadius: '50%',
                  background: getEmotionColor(detectionResult.primary_emotion),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: `0 0 20px ${getEmotionColor(detectionResult.primary_emotion)}40`
                }}>
                  {detectionResult.primary_emotion === 'happy' ? '😊' :
                   detectionResult.primary_emotion === 'sad' ? '😢' :
                   detectionResult.primary_emotion === 'angry' ? '😠' :
                   detectionResult.primary_emotion === 'surprise' ? '😲' :
                   detectionResult.primary_emotion === 'fear' ? '😨' :
                   detectionResult.primary_emotion === 'disgust' ? '🤢' : '😐'}
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', textTransform: 'capitalize', color: getEmotionColor(detectionResult.primary_emotion) }}>
                    {detectionResult.primary_emotion}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {recommendation && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', flex: 1 }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>Recommended Music</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                Strategy: <span style={{ color: 'var(--accent-secondary)' }}>{recommendation.strategy.replace('_', ' ')}</span>
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recommendation.tracks.map((track) => (
                  <div key={track.id} style={{
                    display: 'flex', alignItems: 'center', padding: 'var(--space-3)',
                    background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600 }}>{track.track_name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{track.artist_name} • {track.genre}</p>
                    </div>
                    <button style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: 'var(--accent-primary)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600
                    }}>
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
