import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element: Element }) => {
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);

  return isAuthenticated ? <Element /> : <Navigate to="/signin" />;
};

export default PrivateRoute;