import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  username: null,
  userToken: null, // for storing the JWT
  error: null,
  success: false, // for monitoring the registration process.
};

// TESTING ONLY
const creds = {
  username: 'test',
  password: 'test123',
};

// async thunks
export const login = createAsyncThunk('auth/login', async (args) => {
  try {
    const { user, password } = args;

    // TODO: connect to api, as follows
    //const data = await AuthService.login(email, password);

    // Testing only
    if (user === creds.username && password === creds.password) {
      return {
        username: user,
        userToken: 12344,
      };
    } else {
      throw new Error('Incorrect login details');
    }
  } catch (err) {
    console.error(err);
  }
});

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
      state.userToken = payload.userToken;
    },
    [login.rejected]: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { setAuth, clearAuth } = userSlice.actions;

export default userSlice.reducer;
