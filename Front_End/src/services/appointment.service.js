import api from './api';

// Appointments
export const createAppointment = async (apptData) => {
  const response = await api.post('/appointments', apptData);
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const getAppointment = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const getCustomerAppointments = async (customerId) => {
  const response = await api.get(`/appointments/customer/${customerId}`);
  return response.data;
};

export const patchAppointmentStatus = async (appointmentId, status) => {
  const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
  return response.data;
};

export const patchAppointmentMechanic = async (appointmentId, mechanicId) => {
  const response = await api.patch(`/appointments/${appointmentId}/mechanic`, { mechanicId });
  return response.data;
};

// Packages
export const getPackages = async () => {
  const response = await api.get('/packages');
  return response.data;
};

export const getPackage = async (id) => {
  const response = await api.get(`/packages/${id}`);
  return response.data;
};

export const createPackage = async (packageData) => {
  const response = await api.post('/packages', packageData);
  return response.data;
};

export const updatePackage = async (id, packageData) => {
  const response = await api.put(`/packages/${id}`, packageData);
  return response.data;
};

export const deletePackage = async (id) => {
  const response = await api.delete(`/packages/${id}`);
  return response.data;
};
