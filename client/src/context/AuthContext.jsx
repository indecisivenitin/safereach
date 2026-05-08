import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const initialState = { user: null, token: localStorage.getItem('token'), loading: true, error: null };

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS': return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'LOGOUT':       return { ...state, user: null, token: null, loading: false, error: null };
    case 'UPDATE_USER':  return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_ERROR':    return { ...state, error: action.payload, loading: false };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token');
      if (!token) return dispatch({ type: 'SET_LOADING', payload: false });
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token } });
      } catch {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    };
    restore();
  }, []);

  const login = async (email, password, fcmToken = '') => {
    const { data } = await api.post('/auth/login', { email, password, fcmToken });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates) => dispatch({ type: 'UPDATE_USER', payload: updates });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};



