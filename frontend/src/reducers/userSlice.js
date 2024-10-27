import { createSlice } from '@reduxjs/toolkit';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser(state, action) {
      const user = parseJwt(action.payload.token);
      if (user) {
        const currentTime = Date.now() / 1000;
        if (user.exp && user.exp > currentTime) {
          state.currentUser = { ...user, token: action.payload.token, profilePicture: action.payload.profilePicture }; 
          state.isAuthenticated = true;
          localStorage.setItem('access_token', action.payload.token);
          localStorage.setItem('user_data', JSON.stringify(state.currentUser)); 
        } else {
          console.warn('Token has expired');
          state.isAuthenticated = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data'); 
        }
      }
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data'); 
    },
    initializeUser(state) {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data'); 

      if (token && userData) {
        const decoded = parseJwt(token);
        const currentTime = Date.now() / 1000;

        if (decoded && decoded.exp > currentTime) {
          state.currentUser = { ...decoded, token, ...JSON.parse(userData) }; 
          state.isAuthenticated = true;
        } else {
          console.warn('Token has expired during initialization');
          state.isAuthenticated = false;
          localStorage.removeItem('access_token'); 
          localStorage.removeItem('user_data'); 
        }
      } else {
        state.isAuthenticated = false;
      }
    },
  },
});

export const { setUser, logout, initializeUser } = userSlice.actions;
export default userSlice.reducer;