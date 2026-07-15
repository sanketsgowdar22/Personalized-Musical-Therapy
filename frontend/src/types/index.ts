export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface EmotionDetection {
  id: string;
  modality: 'face' | 'text' | 'voice' | 'multi';
  primary_emotion: string;
  confidence: number;
  all_emotions: Record<string, number>;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  word_count: number;
  emotion_detection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  initial_emotion: string | null;
  final_emotion: string | null;
  message_count: number;
  started_at: string;
  ended_at: string | null;
}

export interface TherapyMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  is_crisis: boolean;
  created_at: string;
}

export interface Track {
  id: string;
  track_name: string;
  artist_name: string;
  spotify_track_id: string | null;
  genre: string | null;
  bpm: number | null;
  valence: number | null;
  energy: number | null;
  position: number;
}

export interface Recommendation {
  recommendation_id: string;
  emotion: string;
  strategy: string;
  tracks: Track[];
}

export interface EmotionSummary {
  emotion: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  total_detections: number;
  period_days: number;
  emotions: EmotionSummary[];
}
