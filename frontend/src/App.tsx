import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmotionDetectionPage } from './pages/EmotionDetectionPage';
import { JournalPage } from './pages/JournalPage';
import { VoiceDetectionPage } from './pages/VoiceDetectionPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

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
                <Route path="/therapy" element={<EmotionDetectionPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/voice" element={<VoiceDetectionPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
