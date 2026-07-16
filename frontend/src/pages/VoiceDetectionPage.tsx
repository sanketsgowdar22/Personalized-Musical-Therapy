import { useState, useRef } from 'react';
import api from '../services/api';
import type { EmotionDetection, Recommendation } from '../types';
import { usePlayerStore } from '../store/playerStore';

export const VoiceDetectionPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [detectionResult, setDetectionResult] = useState<EmotionDetection | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  
  const { setQueue, playTrack } = usePlayerStore();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        await handleAnalyze(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDetectionResult(null);
      setRecommendation(null);
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

  const handleAnalyze = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      // Send to Voice Emotion Detection API
      const { data: detectionData } = await api.post('/emotions/detect/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(detectionData);

      // Fetch recommendations
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

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Vocal Emotion Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Speak your mind. We analyze pitch, tone, and cadence to determine your mood and prescribe music.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
        {/* Recorder Section */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
            border: isRecording ? '2px solid var(--error)' : '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: isRecording ? '0 0 30px rgba(239, 68, 68, 0.4)' : 'none',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
          }} onClick={isRecording ? stopRecording : startRecording}>
            🎤
          </div>
          
          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
              {isRecording ? 'Recording in progress...' : 'Click to start recording'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isProcessing ? 'Analyzing audio...' : 'Speak for at least 5 seconds for best results.'}
            </p>
          </div>

          {audioUrl && !isRecording && !isProcessing && (
            <div style={{ marginTop: 'var(--space-6)', width: '100%' }}>
              <audio src={audioUrl} controls style={{ width: '100%', height: '40px' }} />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {detectionResult && (
            <div className="glass animate-slide-up" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Vocal Analysis Result</h3>
              
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
                    Confidence: {(detectionResult.confidence * 100).toFixed(1)}%
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </div>
  );
};
