import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Configure axios with token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('field', userData.field);
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      formData.append('photo', userData.photo);
      
      const { data } = await axios.post('http://localhost:5000/api/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setAuthToken(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', userData);
      
      setUser({ ...user, ...data });
      localStorage.setItem('userInfo', JSON.stringify({ ...user, ...data }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePhoto = async (photo) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('photo', photo);
      
      const { data } = await axios.put('http://localhost:5000/api/users/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = { ...user, photo: data.photo };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Photo update failed';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete('http://localhost:5000/api/users/photo');
      
      toast.success('Photo removed successfully');
      
      // Refresh user profile to get the default photo
      const { data } = await axios.get('http://localhost:5000/api/auth/profile');
      const updatedUser = { ...user, photo: data.photo };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove photo';
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set initial auth token from storage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      setAuthToken(userInfo.token);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updatePhoto,
        deletePhoto,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 