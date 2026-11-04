import api from './api.js';

export const getMaintenanceRecords = (params = {}) => api.get('/maintenance', { params });
export const getMaintenanceById = (id) => api.get(`/maintenance/${id}`);
export const createMaintenanceRecord = (payload) => api.post('/maintenance', payload);
export const updateMaintenanceRecord = (id, payload) => api.put(`/maintenance/${id}`, payload);
export const resolveMaintenanceRecord = (id, payload) => api.patch(`/maintenance/${id}/resolve`, payload);
export const deleteMaintenanceRecord = (id) => api.delete(`/maintenance/${id}`);
