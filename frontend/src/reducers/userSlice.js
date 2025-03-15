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

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = parseJwt(token);
    if (!decoded) return false;
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

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
        const user = parseJwt(token);
        state.currentUser = { 
          ...user, 
          token,
          profilePicture: action.payload.profilePicture 
        };
        state.isAuthenticated = true;
        localStorage.setItem('access_token', token);
        if (action.payload.user) {
          localStorage.setItem('user_data', JSON.stringify(action.payload.user));
        }
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
      const userData = localStorage.getItem('user_data');

      if (isTokenValid(token)) {
        const decoded = parseJwt(token);
        state.currentUser = {
          ...decoded,
          token,
          ...(userData ? JSON.parse(userData) : {})
        };
        state.isAuthenticated = true;
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