import axios from 'axios';
import { store } from '../store';
import { clearCredentials } from '../store/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Route through API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401/403 responses to handle token expiration/unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear Redux state instead of localStorage
      store.dispatch(clearCredentials());
      
      // Only redirect if not already on the login or register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
