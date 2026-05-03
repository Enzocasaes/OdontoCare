import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../services/api';

const savedToken = localStorage.getItem('odontocare_token');
const savedUser = localStorage.getItem('odontocare_user');

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Falha ao autenticar');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken || null,
    user: savedUser ? JSON.parse(savedUser) : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('odontocare_token');
      localStorage.removeItem('odontocare_user');
      setAuthToken(null);
    },
    hydrateToken: (state) => {
      if (state.token) setAuthToken(state.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('odontocare_token', action.payload.token);
        localStorage.setItem('odontocare_user', JSON.stringify(action.payload.user));
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, hydrateToken } = authSlice.actions;
export default authSlice.reducer;
