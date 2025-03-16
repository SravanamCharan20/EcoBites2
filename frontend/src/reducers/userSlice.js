/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

const parseJwt = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

// Helper function to ensure consistent user data structure
const createUserState = (decoded, userData, token) => {
  // Ensure we have the profile picture from userData
  const profilePicture = userData?.profilePicture || null;
  
  console.log('Creating user state with profile picture:', profilePicture);
  
  return {
    ...decoded,
    ...userData,
    token,
    // Always use the Cloudinary URL if available
    profilePicture: profilePicture 
      ? `${profilePicture}${profilePicture.includes('?') ? '&' : '?'}t=${Date.now()}`
      : null
  };
};

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: true
  },
  reducers: {
    setUser(state, action) {
      const token = action.payload.token;
      if (isTokenValid(token)) {
        const decoded = parseJwt(token);
        const userData = action.payload.user || {};
        
        // Use helper function to create consistent user state
        state.currentUser = createUserState(decoded, userData, token);
        state.isAuthenticated = true;
        
        // Store complete user data in localStorage with profile picture
        const dataToStore = {
          ...userData,
          profilePicture: userData.profilePicture || null
        };
        
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_data', JSON.stringify(dataToStore));

        console.log('Redux: Setting user state:', {
          profilePicture: state.currentUser.profilePicture,
          userData: dataToStore
        });
      } else {
        state.currentUser = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
      state.loading = false;
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    },
    initializeUser(state) {
      const token = localStorage.getItem('access_token');
      const userDataStr = localStorage.getItem('user_data');

      if (isTokenValid(token) && userDataStr) {
        try {
          const decoded = parseJwt(token);
          const userData = JSON.parse(userDataStr);
          
          // Use helper function to create consistent user state
          state.currentUser = createUserState(decoded, userData, token);
          state.isAuthenticated = true;

          console.log('Redux: Initializing user state:', {
            profilePicture: state.currentUser.profilePicture,
            userData: userData
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          state.currentUser = null;
          state.isAuthenticated = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
        }
      } else {
        state.currentUser = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    }
  },
});

export const { setUser, logout, initializeUser, setLoading } = userSlice.actions;
export default userSlice.reducer;