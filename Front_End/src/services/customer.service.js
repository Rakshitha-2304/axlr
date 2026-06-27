import api from './api';

export const getCustomerProfile = async (userId) => {
  const response = await api.get(`/customers/${userId}`);
  return response.data;
};

export const createCustomerProfile = async (profileData) => {
  const response = await api.post('/customers', profileData);
  return response.data;
};

export const updateCustomerProfile = async (userId, profileData) => {
  const response = await api.put(`/customers/${userId}`, profileData);
  return response.data;
};
