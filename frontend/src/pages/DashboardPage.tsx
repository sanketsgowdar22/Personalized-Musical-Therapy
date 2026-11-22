import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { PlayCircle, Activity, Heart, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '0 1rem' }}
    >
      <motion.header variants={itemVariants} style={{ marginBottom: '3rem', position: 'relative' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Welcome back, <span className="gradient-text">{user?.full_name || 'User'}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your daily therapeutic soundscape is ready.</p>

        {/* Decorative element */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: '150px', height: '150px', background: 'var(--accent-glow)', filter: 'blur(60px)', zIndex: -1, borderRadius: '50%' }} />
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Quick Actions Card */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', opacity: 0.1 }}>
            <Sparkles size={160} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(124, 58, 237, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-primary)' }}>
              <PlayCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Face AI Session</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
            Begin an AI-guided therapy session. We'll analyze your facial expressions to generate a custom therapeutic soundscape.
          </p>
          <button
            onClick={() => navigate('/therapy')}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            Start Session
          </button>
        </motion.div>

        {/* Emotion Summary Card */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--success)' }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Emotional State</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 20px rgba(16,185,129,0.1)'
            }}>
              😌
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Calm</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Clock size={14} />
                <span>Detected 2 hours ago via Voice</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mini Stats */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-secondary)' }}>
              <Heart size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Therapy Minutes</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>124 <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>min</span></p>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-lg)', color: '#3B82F6' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Sessions Completed</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
