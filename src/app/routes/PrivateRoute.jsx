import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Mientras valida sesión
  if (loading) {
    return null;
  }

  // Si está autenticado → entra
  if (isAuthenticated) {
    return children;
  }

  // Si no → redirige a login
  return <Navigate to="/login" replace />;
}
