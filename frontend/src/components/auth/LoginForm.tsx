import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail?.message || 'Authentication failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel"
      style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '440px', zIndex: 10 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent-glow)', margin: '0 auto 1.5rem auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '2rem' }}>🎶</span>
        </motion.div>

        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          {isLogin ? 'Welcome Back' : 'Join the Journey'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? 'Enter your details to access your therapy dashboard' : 'Create an account to start your musical therapy journey'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  placeholder="John Doe"
                  style={{
                    width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)',
                    outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)',
                outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border)',
                outline: 'none', color: 'var(--text-primary)', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="btn-primary"
          style={{
            marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--accent-secondary)', fontWeight: 600, transition: 'color 0.2s' }}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </motion.div>
  );
};
