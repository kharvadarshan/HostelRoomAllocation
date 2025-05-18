import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 