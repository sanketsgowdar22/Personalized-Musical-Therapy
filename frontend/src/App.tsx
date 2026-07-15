import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                {/* Future routes to be implemented in Phase 09 */}
                <Route path="/therapy" element={<div>Therapy Flow coming soon...</div>} />
                <Route path="/journal" element={<div>Journal Flow coming soon...</div>} />
                <Route path="/music" element={<div>Music Recommender coming soon...</div>} />
                <Route path="/analytics" element={<div>Analytics coming soon...</div>} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
