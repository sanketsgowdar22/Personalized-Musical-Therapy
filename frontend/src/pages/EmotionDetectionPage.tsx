import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { WebcamDetector } from '../components/therapy/WebcamDetector';
import { usePlayerStore } from '../store/playerStore';

export const EmotionDetectionPage = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'live'>('upload');
  const { setQueue, playTrack } = usePlayerStore();
  
  // Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared State
  const [detectionResult, setDetectionResult] = useState<EmotionDetection | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  // Live Camera State
  const [liveEmotion, setLiveEmotion] = useState<{name: string, confidence: number} | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      setIsCameraActive(false);
    };
  }, []);

  // Fetch recommendations when live emotion settles
  useEffect(() => {
    if (activeTab === 'live' && liveEmotion && isCameraActive) {
      const timer = setTimeout(() => {
        api.get('/music/recommendations', {
          params: { emotion: liveEmotion.name, limit: 5 },
        }).then(({ data }) => {
          setRecommendation(data);
          // Don't auto-play queue here to avoid jarring user experience
        }).catch(err => console.error("Rec error", err));
      }, 3000); 
      
      return () => clearTimeout(timer);
    }
  }, [liveEmotion, activeTab, isCameraActive]);

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
      const { data: detectionData } = await api.post('/emotions/detect/face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(detectionData);

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

  const playEntireQueue = () => {
    if (recommendation) {
      setQueue(recommendation.tracks);
    }
  };

  const handlePlaySingle = (track: any) => {
    if (recommendation) {
      setQueue(recommendation.tracks);
    }
    playTrack(track);
  };

  const getEmotionColor = (emotion: string) => {
    return `var(--emotion-${emotion.toLowerCase()})`;
  };

  const displayEmotion = activeTab === 'upload' ? detectionResult?.primary_emotion : liveEmotion?.name;
  const displayConfidence = activeTab === 'upload' ? detectionResult?.confidence : liveEmotion?.confidence;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Facial Emotion Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Detect your current emotion and get a personalized music prescription.
        </p>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <button 
            onClick={() => { setActiveTab('upload'); setIsCameraActive(false); }}
            style={{
              padding: 'var(--space-2) var(--space-6)',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'upload' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'upload' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Upload Photo
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            style={{
              padding: 'var(--space-2) var(--space-6)',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'live' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'live' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Live Camera
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
        {/* Input Section */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          {activeTab === 'upload' ? (
            <>
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
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <WebcamDetector 
                isActive={isCameraActive} 
                onEmotionDetected={(emotion, conf) => setLiveEmotion({name: emotion, confidence: conf})} 
              />
              <button
                onClick={() => setIsCameraActive(!isCameraActive)}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: isCameraActive ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-gradient)',
                  color: isCameraActive ? 'var(--error)' : 'white',
                  fontWeight: 600,
                  border: isCameraActive ? '1px solid var(--error)' : 'none',
                }}
              >
                {isCameraActive ? 'Stop Camera' : 'Start Live Detection'}
              </button>
              {isCameraActive && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                  Playlist will automatically update based on your sustained emotion.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {displayEmotion && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Analysis Result</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: '80px', height: '80px',
                  borderRadius: '50%',
                  background: getEmotionColor(displayEmotion),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: `0 0 20px ${getEmotionColor(displayEmotion)}40`,
                  transition: 'all 0.5s ease'
                }}>
                  {displayEmotion === 'happy' ? '😊' :
                   displayEmotion === 'sad' ? '😢' :
                   displayEmotion === 'angry' ? '😠' :
                   displayEmotion === 'surprise' ? '😲' :
                   displayEmotion === 'fear' ? '😨' :
                   displayEmotion === 'disgust' ? '🤢' : '😐'}
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', textTransform: 'capitalize', color: getEmotionColor(displayEmotion) }}>
                    {displayEmotion}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Confidence: {displayConfidence ? (displayConfidence * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {recommendation && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Recommended Music</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Strategy: <span style={{ color: 'var(--accent-secondary)' }}>{recommendation.strategy.replace('_', ' ')}</span>
                  </p>
                </div>
                
                <button
                  onClick={playEntireQueue}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  Play Therapy Session
                </button>
              </div>
              
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
                    <button 
                      onClick={() => handlePlaySingle(track)}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--accent-primary)',
                        borderRadius: 'var(--radius-full)',
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
