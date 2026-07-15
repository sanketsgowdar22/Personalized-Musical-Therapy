import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const DashboardPage = () => {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>
          Welcome back, <span className="gradient-text">{user?.full_name || 'User'}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's your therapeutic overview for today.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Quick Actions Card */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Start a Session</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Begin an AI-guided therapy session with facial emotion tracking.</p>
          <button style={{
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-gradient)',
            color: 'white',
            fontWeight: 600,
            boxShadow: 'var(--shadow-glow)'
          }}>Start Now</button>
        </div>

        {/* Emotion Summary Card */}
        <div className="glass" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)' }}>Recent Emotion</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ 
              width: 64, height: 64, 
              borderRadius: '50%', 
              background: 'var(--emotion-neutral)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem'
            }}>
              😐
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>Neutral</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Detected 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
