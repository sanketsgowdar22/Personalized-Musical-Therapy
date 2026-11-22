import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { WebcamDetector } from '../components/therapy/WebcamDetector';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Upload, Loader2, Play, Music, Sparkles } from 'lucide-react';

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
          Facial <span className="gradient-text">Analysis</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Detect your current emotion and get a personalized music prescription.
        </p>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-full)', width: 'fit-content', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setActiveTab('upload'); setIsCameraActive(false); }}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: activeTab === 'upload' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'upload' ? 'white' : 'var(--text-secondary)',
              fontWeight: activeTab === 'upload' ? 600 : 500,
              transition: 'all 0.3s'
            }}
          >
            <ImageIcon size={18} /> Upload Photo
          </button>
          <button
            onClick={() => setActiveTab('live')}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: activeTab === 'live' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'live' ? 'white' : 'var(--text-secondary)',
              fontWeight: activeTab === 'live' ? 600 : 500,
              transition: 'all 0.3s'
            }}
          >
            <Camera size={18} /> Live Camera
          </button>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Input Section */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  style={{
                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                    padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                    marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ maxHeight: '300px', margin: '0 auto', borderRadius: 'var(--radius-md)' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                        <Upload size={32} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Click to upload an image</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                </div>

                <motion.button
                  whileHover={(!selectedImage || isProcessing) ? {} : { scale: 1.02 }}
                  whileTap={(!selectedImage || isProcessing) ? {} : { scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={!selectedImage || isProcessing}
                  className="btn-primary"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    opacity: (!selectedImage || isProcessing) ? 0.5 : 1,
                  }}
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={20} /> Analyzing Emotion...</>
                  ) : (
                    <><Sparkles size={20} /> Detect Emotion & Get Music</>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <WebcamDetector
                  isActive={isCameraActive}
                  onEmotionDetected={(emotion, conf) => setLiveEmotion({name: emotion, confidence: conf})}
                />
                <button
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className="btn-primary"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    background: isCameraActive ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-gradient)',
                    color: isCameraActive ? 'var(--error)' : 'white',
                    border: isCameraActive ? '1px solid var(--error)' : 'none',
                    boxShadow: isCameraActive ? 'none' : 'var(--shadow-glow)'
                  }}
                >
                  {isCameraActive ? <><Camera size={20} /> Stop Camera</> : <><Camera size={20} /> Start Live Detection</>}
                </button>
                {isCameraActive && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                    Playlist will automatically update based on your sustained emotion.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {displayEmotion && (
              <motion.div
                key={`emotion-${displayEmotion}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', right: 0, top: 0, width: '150px', height: '150px', background: getEmotionColor(displayEmotion), filter: 'blur(80px)', zIndex: -1, opacity: 0.3 }} />

                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Analysis Result</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }}
                    style={{
                      width: '90px', height: '90px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getEmotionColor(displayEmotion)}40, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                      border: `1px solid ${getEmotionColor(displayEmotion)}80`,
                      boxShadow: `0 0 30px ${getEmotionColor(displayEmotion)}40`
                    }}
                  >
                    {displayEmotion === 'happy' ? '😊' :
                     displayEmotion === 'sad' ? '😢' :
                     displayEmotion === 'angry' ? '😠' :
                     displayEmotion === 'surprise' ? '😲' :
                     displayEmotion === 'fear' ? '😨' :
                     displayEmotion === 'disgust' ? '🤢' : '😐'}
                  </motion.div>
                  <div>
                    <p style={{ fontSize: '2rem', fontWeight: 700, textTransform: 'capitalize', color: getEmotionColor(displayEmotion), marginBottom: '0.25rem' }}>
                      {displayEmotion}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getEmotionColor(displayEmotion) }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {(displayConfidence ? displayConfidence * 100 : 0).toFixed(1)}% Confidence
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
                        onClick={() => handlePlaySingle(track)}
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
