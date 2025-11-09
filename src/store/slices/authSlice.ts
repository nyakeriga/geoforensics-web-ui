import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/auth/login', credentials);
      const { access_token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('access_token', access_token);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return { token: access_token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('access_token');
      delete axios.defaults.headers.common['Authorization'];

      return null;
    } catch (error: any) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('No token found');
      }

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token by making a request
      const response = await axios.get('/api/v1/auth/me');
      return response.data;
    } catch (error: any) {
      // Clear invalid token
      localStorage.removeItem('access_token');
      delete axios.defaults.headers.common['Authorization'];

      return rejectWithValue('Invalid token');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/v1/users/me', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Profile update failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;