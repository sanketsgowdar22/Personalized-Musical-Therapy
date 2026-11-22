import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { LayoutDashboard, Camera, Mic, BookOpen, BarChart3, LogOut, User } from 'lucide-react';

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/therapy', label: 'Face AI', icon: Camera },
    { to: '/voice', label: 'Voice AI', icon: Mic },
    { to: '/journal', label: 'Journal AI', icon: BookOpen },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="app-layout__sidebar glass" style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>MT</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Therapy<span className="gradient-text">AI</span></h1>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map((link) => {
          const isActive = pathname === link.to;
          const Icon = link.icon;

          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                transition: 'color var(--transition-fast)',
                zIndex: 1
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-tab"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-indicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    bottom: '25%',
                    width: '3px',
                    background: 'var(--accent-primary)',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                />
              )}
              <Icon size={20} style={{ color: isActive ? 'var(--accent-primary)' : 'currentColor' }} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="var(--text-secondary)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.full_name || 'User'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Plan</p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};
