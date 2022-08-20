import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  username: null,
  access_token: null, // for storing the JWT
  error: null,
  success: false, // for monitoring the registration process.
};

// async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ user, password }, { rejectWithValue }) => {
    try {
      const config = {
        method: 'post',
        url: `${process.env.REACT_APP_API_ENDPOINT}/auth/login`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          username: user,
          password: password,
        },
      };

      console.log(JSON.stringify(process.env));
      const { data } = await axios(config);

      localStorage.setItem('access_token', data.access_token);

      return { access_token: data.access_token, username: user };
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearAuth: () => {
      return initialState;
    },
  },
  extraReducers: {
    [login.pending]: (state) => {
      state.isLoading = true;
    },
    [login.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.success = true;
      state.username = payload.username;
      state.access_token = payload.access_token;
    },
    [login.rejected]: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { setAuth, clearAuth } = userSlice.actions;

export default userSlice.reducer;
