import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export const AuthPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-layout">
      <LoginForm />
    </div>
  );
};
