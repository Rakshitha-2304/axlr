import api from './api';

export const register = async (username, password, email, role) => {
  const response = await api.post('/auth/register', { username, password, email, role });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data; // returns { token, username, role, userId }
};

export const getMechanics = async () => {
  const response = await api.get('/auth/users/role/MECHANIC');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const getPendingUsers = async () => {
  const response = await api.get('/auth/users/pending');
  return response.data;
};

export const approveUser = async (id) => {
  const response = await api.put(`/auth/users/${id}/approve`);
  return response.data;
};

export const rejectUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};
