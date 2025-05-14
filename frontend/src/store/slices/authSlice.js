import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Set axios defaults
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      // Set auth token in axios headers
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to login'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('field', userData.field);
      formData.append('username', userData.username);
      formData.append('password', userData.password);
      if (userData.photo) {
        formData.append('photo', userData.photo);
      }
      
      const { data } = await axios.post('http://localhost:5000/api/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Set auth token in axios headers
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put('http://localhost:5000/api/auth/profile', userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

export const updatePhoto = createAsyncThunk(
  'auth/updatePhoto',
  async (photo, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      
      const { data } = await axios.put('http://localhost:5000/api/users/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update photo'
      );
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'auth/deletePhoto',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete('http://localhost:5000/api/users/photo');
      
      // Refresh the user profile to get updated data
      const { data } = await axios.get('http://localhost:5000/api/auth/profile');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete photo'
      );
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/profile');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user profile'
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      setAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Photo
      .addCase(updatePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePhoto.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.photo = action.payload.photo;
        }
      })
      .addCase(updatePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Photo
      .addCase(deletePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer; 