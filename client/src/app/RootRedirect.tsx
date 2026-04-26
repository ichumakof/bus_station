import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RootRedirect() {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'Admin') {
    return <Navigate to="/admin/users" replace />;
  }

  if (role === 'Operator') {
    return <Navigate to="/manage/routes" replace />;
  }

  return <Navigate to="/trips" replace />;
}
