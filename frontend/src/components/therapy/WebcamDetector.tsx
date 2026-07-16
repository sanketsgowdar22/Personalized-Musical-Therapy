import { useRef, useEffect, useState, useCallback } from 'react';


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
    // In a real app, URL comes from config
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
      // Optionally implement reconnect logic here
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
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#000' }}>
      {error ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--error)' }}>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: 'auto', display: isActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {isActive && !streamRef.current && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
              Initializing camera...
            </div>
          )}

          {isActive && currentEmotion && (
            <div style={{ 
              position: 'absolute', bottom: 'var(--space-4)', left: 'var(--space-4)',
              background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              border: `1px solid ${getEmotionColor(currentEmotion.name)}`,
              boxShadow: `0 0 15px ${getEmotionColor(currentEmotion.name)}40`
            }}>
              <span style={{ 
                width: 12, height: 12, borderRadius: '50%', 
                background: getEmotionColor(currentEmotion.name) 
              }} />
              <span style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                {currentEmotion.name} ({(currentEmotion.confidence * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
