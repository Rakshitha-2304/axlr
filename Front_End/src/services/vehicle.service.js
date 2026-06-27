import api from './api';

export const getVehicle = async (id) => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const getCustomerVehicles = async (customerId) => {
  const response = await api.get(`/vehicles/customer/${customerId}`);
  return response.data;
};

export const registerVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};
