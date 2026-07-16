import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { AudioPlayer } from '../player/AudioPlayer';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '280px', 
        padding: 'var(--space-8)',
        paddingBottom: '120px' // Add padding for AudioPlayer
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
};
