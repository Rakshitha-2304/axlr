import api from './api';

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments/process', paymentData);
  return response.data;
};

export const getCustomerPayments = async (customerId) => {
  const response = await api.get(`/payments/customer/${customerId}`);
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};
