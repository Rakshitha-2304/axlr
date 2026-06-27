import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCustomerProfile } from '../services/customer.service';
import { setCredentials, clearCredentials, setCustomerProfile as setReduxCustomerProfile } from '../store/authSlice';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Retrieve state dynamically from Redux
  const authState = useSelector((state) => state.auth);
  const customerProfile = useSelector((state) => state.auth.customerProfile);

  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    setLoadingProfile(true);
    try {
      const profile = await getCustomerProfile(userId);
      dispatch(setReduxCustomerProfile(profile));
      return profile;
    } catch (err) {
      console.warn('Customer profile not created yet or service offline', err);
      dispatch(setReduxCustomerProfile(null));
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, [dispatch]);

  const login = async (data) => {
    // Standard mock structure or API response: { token, username, role, userId }
    let userId = data.userId || null;
    if (!userId) {
      try {
        if (data.token) {
          const base64Url = data.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const parsed = JSON.parse(jsonPayload);
          // Look for common claims
          userId = parsed.userId || parsed.id || 1; // Fallback to 1 if not explicitly in token
        }
      } catch (e) {
        console.error('Error parsing token payload', e);
        userId = 1; // Fallback
      }
    }

    dispatch(
      setCredentials({
        token: data.token,
        username: data.username,
        role: data.role,
        userId: String(userId),
      })
    );

    if (data.role === 'CUSTOMER') {
      await fetchProfile(userId);
    }
  };

  const logout = () => {
    dispatch(clearCredentials());
  };

  const isAuthenticated = () => !!authState.token;

  // Load profile on initialization if user is CUSTOMER and logged in
  useEffect(() => {
    if (authState.token && authState.role === 'CUSTOMER' && authState.userId) {
      fetchProfile(authState.userId);
    }
  }, [authState.token, authState.role, authState.userId, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        customerProfile,
        loadingProfile,
        login,
        logout,
        isAuthenticated,
        refreshProfile: () => fetchProfile(authState.userId),
        setCustomerProfile: (profile) => dispatch(setReduxCustomerProfile(profile)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
