import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps a route element and redirects to /login if not authenticated.
 * Usage: <ProtectedRoute><TodoPage /></ProtectedRoute>
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return null; // could render a spinner here later
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
