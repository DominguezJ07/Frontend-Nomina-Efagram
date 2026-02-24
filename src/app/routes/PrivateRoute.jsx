import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) return children;

  return <Navigate to="/login" replace />;
}