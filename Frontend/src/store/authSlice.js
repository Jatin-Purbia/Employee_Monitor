import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { authApi } from '../api';

const persistSession = (user, token) => {
  localStorage.setItem('employeeUser', JSON.stringify(user));
  localStorage.setItem('authToken', token);
};

const clearSession = () => {
  localStorage.removeItem('employeeUser');
  localStorage.removeItem('authToken');
};

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const storedUser = localStorage.getItem('employeeUser');
  const storedToken = localStorage.getItem('authToken');

  if (storedUser && storedToken) {
    return { user: JSON.parse(storedUser), token: storedToken };
  }

  // Try Firebase current user if no stored session
  const current = auth.currentUser;
  if (current) {
    const idToken = await current.getIdToken();
    const { data } = await authApi.login(idToken);
    persistSession(data, idToken);
    return { user: data, token: idToken };
  }

  return { user: null, token: null };
});

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password, expectedRole }, { rejectWithValue }) => {
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();
      const { data } = await authApi.login(idToken);

      if (expectedRole && data.role !== expectedRole) {
        await signOut(auth);
        return rejectWithValue(`Account is registered as ${data.role}`);
      }

      persistSession(data, idToken);
      return { user: data, token: idToken };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      // Create user via backend and Firebase Admin
      await authApi.signup({ name, email, password, role });

      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credentials.user.getIdToken();
      const { data } = await authApi.login(idToken);

      persistSession(data, idToken);
      return { user: data, token: idToken };
    } catch (error) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async ({ expectedRole }, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await authApi.login(idToken);

      if (expectedRole && data.role !== expectedRole) {
        await signOut(auth);
        return rejectWithValue(`This account is registered as ${data.role}. Please sign in as ${data.role} instead.`);
      }

      persistSession(data, idToken);
      return { user: data, token: idToken };
    } catch (error) {
      return rejectWithValue(error.message || 'Google sign-in failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
  clearSession();
  return { user: null, token: null };
});

const initialState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.user = null;
        state.token = null;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(signupWithEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export default authSlice.reducer;

