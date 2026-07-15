import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        <div className="app-layout__content">{children}</div>
      </main>
    </div>
  );
};
