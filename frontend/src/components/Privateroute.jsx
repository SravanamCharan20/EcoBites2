import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;