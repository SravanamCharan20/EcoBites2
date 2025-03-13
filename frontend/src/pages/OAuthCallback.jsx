import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import { jwtDecode } from 'jwt-decode';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        // Store the token
        localStorage.setItem('access_token', token);
        
        // Decode token to get user data
        const decoded = jwtDecode(token);
        
        // Update Redux store with token and decoded user data
        dispatch(setUser({ token, user: decoded }));
        
        // Get the saved redirect path or default to home
        const redirectPath = localStorage.getItem('redirectPath') || '/';
        localStorage.removeItem('redirectPath'); // Clean up
        
        // Redirect to the saved path
        navigate(redirectPath);
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        navigate('/signin');
      }
    } else {
      // If no token, redirect to sign in
      navigate('/signin');
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthCallback; 