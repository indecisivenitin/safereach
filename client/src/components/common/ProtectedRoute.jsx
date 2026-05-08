import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
