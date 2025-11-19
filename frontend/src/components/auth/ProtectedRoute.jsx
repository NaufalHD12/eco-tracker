import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '../ui/loading-spinner';

export const ProtectedRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login page - simple and direct
    return <Navigate to="/login" replace />;
  }

  // For now, just return children - onboarding handled inside app
  return children;
};
