import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUnallocatedUsers = createAsyncThunk(
  'users/fetchUnallocatedUsers',
  async ({ group, level } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (group) params.group = group;
      if (level) params.level = level;
      
      const { data } = await api.get('/users/unallocated', { params });
      
      if (data.ok) {
        return data.users;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch unallocated users');
      }
    } catch (error) {
      console.error('Error fetching unallocated users:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch unallocated users'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const promoteToAdmin = createAsyncThunk(
  'users/promoteToAdmin',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}/promote`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to promote user to admin'
      );
    }
  }
);

// Initial state
const initialState = {
  users: [],
  unallocatedUsers: [],
  unallocatedUsersByGroup: {},
  unallocatedUsersByLevel: {},
  selectedUser: null,
  loading: false,
  error: null
};

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    removeAllocatedUser: (state, action) => {
      // Remove user from unallocatedUsers when they get allocated
      state.unallocatedUsers = state.unallocatedUsers.filter(
        user => user._id !== action.payload
      );
      
      // Also remove from grouped users
      Object.keys(state.unallocatedUsersByGroup).forEach(group => {
        state.unallocatedUsersByGroup[group] = state.unallocatedUsersByGroup[group].filter(
          user => user._id !== action.payload
        );
      });
      
      // And from level-grouped users
      Object.keys(state.unallocatedUsersByLevel).forEach(level => {
        state.unallocatedUsersByLevel[level] = state.unallocatedUsersByLevel[level].filter(
          user => user._id !== action.payload
        );
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Unallocated Users
      .addCase(fetchUnallocatedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnallocatedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.unallocatedUsers = action.payload;
        
        // Organize users by group
        const usersByGroup = {};
        action.payload.forEach(user => {
          if (!usersByGroup[user.group]) {
            usersByGroup[user.group] = [];
          }
          usersByGroup[user.group].push(user);
        });
        state.unallocatedUsersByGroup = usersByGroup;
        
        // Organize users by level
        const usersByLevel = {};
        action.payload.forEach(user => {
          if (!usersByLevel[user.level]) {
            usersByLevel[user.level] = [];
          }
          usersByLevel[user.level].push(user);
        });
        state.unallocatedUsersByLevel = usersByLevel;
      })
      .addCase(fetchUnallocatedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Find and update the user in the users array
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Promote to Admin
      .addCase(promoteToAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(promoteToAdmin.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the users array
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(promoteToAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedUser, 
  clearSelectedUser, 
  clearError,
  removeAllocatedUser
} = userSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectUnallocatedUsers = (state) => state.users.unallocatedUsers;
export const selectUnallocatedUsersByGroup = (state) => state.users.unallocatedUsersByGroup;
export const selectUnallocatedUsersByLevel = (state) => state.users.unallocatedUsersByLevel;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default userSlice.reducer; 