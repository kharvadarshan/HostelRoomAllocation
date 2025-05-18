import api from './index';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Initialize auth token
export const setupInterceptors = () => {
  // Add response interceptor for handling 401 errors globally
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log detailed error information
      console.error('API Error:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        data: error?.response?.data,
        message: error?.message
      });
      
      if (error?.response?.status === 401) {
        console.warn('Unauthorized access detected, logging out user');
        // If we get a 401 (Unauthorized) response, log the user out
        store.dispatch(logout());
        localStorage.removeItem('token');
      }
      return Promise.reject(error);
    }
  );
};

// Check for token on initial load
export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Token will be automatically added to requests by the interceptor in api/index.js
    console.log('Auth token initialized from localStorage');
  } else {
    console.log('No auth token found in localStorage');
  }
}; 