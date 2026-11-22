import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';

interface WebcamDetectorProps {
  onEmotionDetected: (emotion: string, confidence: number) => void;
  isActive: boolean;
}

export const WebcamDetector = ({ onEmotionDetected, isActive }: WebcamDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<{name: string, confidence: number} | null>(null);

  // Initialize WebRTC
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const wsUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('http', 'ws') + '/emotions/ws/detect/face'
      : 'ws://localhost:8000/api/v1/emotions/ws/detect/face';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to emotion detection stream');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'success' && data.prediction) {
          const emotion = data.prediction.primary_emotion;
          const confidence = data.prediction.confidence;

          setCurrentEmotion({ name: emotion, confidence });
          onEmotionDetected(emotion, confidence);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from emotion stream');
      wsRef.current = null;
    };

    return ws;
  }, [onEmotionDetected]);

  // Main lifecycle
  useEffect(() => {
    if (isActive) {
      startCamera();
      connectWebSocket();
    } else {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
      setCurrentEmotion(null);
    }

    return () => {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isActive, connectWebSocket]);

  // Frame capture loop
  useEffect(() => {
    let animationFrameId: number;
    let lastCaptureTime = 0;
    const captureInterval = 1000; // 1 frame per second to save bandwidth/compute

    const captureFrame = (timestamp: number) => {
      if (!isActive || !videoRef.current || !canvasRef.current || !wsRef.current) return;

      if (wsRef.current.readyState === WebSocket.OPEN && timestamp - lastCaptureTime >= captureInterval) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure video has loaded data
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to JPEG blob and send
            canvas.toBlob((blob) => {
              if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(blob);
              }
            }, 'image/jpeg', 0.7); // 70% quality

            lastCaptureTime = timestamp;
          }
        }
      }

      animationFrameId = requestAnimationFrame(captureFrame);
    };

    if (isActive) {
      animationFrameId = requestAnimationFrame(captureFrame);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive]);

  const getEmotionColor = (emotion: string) => {
    return `var(--emotion-${emotion.toLowerCase()})`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-secondary)', aspectRatio: '4/3', border: '1px solid var(--border)' }}>
      {error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--error)' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <AnimatePresence>
            {!isActive && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
              >
                <Camera size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 500 }}>Camera is inactive</p>
              </motion.div>
            )}

            {isActive && !streamRef.current && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', color: 'white', zIndex: 10 }}
              >
                <Loader2 size={40} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                <p>Initializing camera...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isActive && streamRef.current && (
            <>
              {/* Premium Scanning Overlay */}
              <div style={{ position: 'absolute', inset: '2rem', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '1rem', pointerEvents: 'none' }}>
                {/* Corner markers */}
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--accent-primary)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '1rem 0 0 0' }} />
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--accent-primary)', borderRight: '4px solid var(--accent-primary)', borderRadius: '0 1rem 0 0' }} />
                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--accent-primary)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '0 0 0 1rem' }} />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--accent-primary)', borderRight: '4px solid var(--accent-primary)', borderRadius: '0 0 1rem 0' }} />

                {/* Scanning line */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--accent-primary)', boxShadow: '0 0 20px var(--accent-primary), 0 0 10px var(--accent-primary)' }}
                />
              </div>

              {/* Live Status indicator */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }} />
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>LIVE</span>
              </div>
            </>
          )}

          <AnimatePresence>
            {isActive && currentEmotion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                style={{
                  position: 'absolute', bottom: '1.5rem', left: '1.5rem',
                  background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(12px)',
                  padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  border: `1px solid ${getEmotionColor(currentEmotion.name)}50`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${getEmotionColor(currentEmotion.name)}30`
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 14, height: 14, borderRadius: '50%', background: getEmotionColor(currentEmotion.name), boxShadow: `0 0 10px ${getEmotionColor(currentEmotion.name)}` }}
                />
                <span style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.5px' }}>
                  {currentEmotion.name}
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.5rem' }}>
                    {(currentEmotion.confidence * 100).toFixed(0)}%
                  </span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
