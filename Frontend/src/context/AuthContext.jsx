import { Provider, useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { store } from '../store';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  logout as logoutThunk,
  restoreSession,
} from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, status, error } = useSelector((state) => state.auth);

  const actions = useMemo(
    () => ({
      getToken: () => token,
      login: async (email, password, expectedRole) => {
        const result = await dispatch(loginWithEmail({ email, password, expectedRole }));
        if (result.meta.requestStatus === 'fulfilled') {
          return { success: true };
        }
        return { success: false, error: result.payload || result.error?.message };
      },
      signup: async (name, email, password, role = 'employee') => {
        const result = await dispatch(signupWithEmail({ name, email, password, role }));
        if (result.meta.requestStatus === 'fulfilled') {
          return { success: true };
        }
        return { success: false, error: result.payload || result.error?.message };
      },
      loginWithGoogle: async (expectedRole = null) => {
        const result = await dispatch(loginWithGoogle({ expectedRole }));
        if (result.meta.requestStatus === 'fulfilled') {
          return { success: true };
        }
        return { success: false, error: result.payload || result.error?.message };
      },
      logout: async () => {
        await dispatch(logoutThunk());
      },
    }),
    [dispatch, token]
  );

  return {
    user,
    loading: status === 'loading',
    error,
    ...actions,
  };
};

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return children;
};

export const AuthProvider = ({ children }) => (
  <Provider store={store}>
    <AuthInitializer>{children}</AuthInitializer>
  </Provider>
);

