import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { currentUser, isAuthenticated, loading } = useSelector(state => state.user);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;