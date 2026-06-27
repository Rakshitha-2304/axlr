import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  role: localStorage.getItem('role') || null,
  userId: localStorage.getItem('userId') || null,
  customerProfile: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, username, role, userId } = action.payload;
      state.token = token;
      state.username = username;
      state.role = role;
      state.userId = userId;
      if (token) localStorage.setItem('token', token);
      if (username) localStorage.setItem('username', username);
      if (role) localStorage.setItem('role', role);
      if (userId) localStorage.setItem('userId', userId);
    },
    clearCredentials: (state) => {
      state.token = null;
      state.username = null;
      state.role = null;
      state.userId = null;
      state.customerProfile = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('paid_appointment_ids');
    },
    setCustomerProfile: (state, action) => {
      state.customerProfile = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setCustomerProfile } = authSlice.actions;

export default authSlice.reducer;
