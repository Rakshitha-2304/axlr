import api from './api';

export const getNotifications = async (userId) => {
  const response = await api.get(`/notifications/${userId}`);
  return response.data;
};

export const markNotificationsAsRead = async (userId) => {
  const response = await api.patch(`/notifications/${userId}/read`);
  return response.data;
};
