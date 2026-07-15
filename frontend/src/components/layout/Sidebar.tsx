import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const links = [
    { to: '/', label: 'Dashboard', icon: '🏠' },
    { to: '/therapy', label: 'AI Therapy', icon: '💬' },
    { to: '/journal', label: 'Journal', icon: '📓' },
    { to: '/music', label: 'Music', icon: '🎵' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <aside className="app-layout__sidebar glass" style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
      <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--border)' }}>
        <h1 className="gradient-text" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>AI Musical Therapy</h1>
      </div>

      <nav style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: pathname === link.to ? 'var(--accent-glow)' : 'transparent',
              color: pathname === link.to ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              fontWeight: pathname === link.to ? 600 : 500,
              transition: 'var(--transition-fast)'
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};
