import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/qr-reader" replace />;
  }

  return children;
};

export default ProtectedRoute;