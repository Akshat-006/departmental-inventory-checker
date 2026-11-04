import api from './api.js';

export const getEquipment = (params = {}) => api.get('/equipment', { params });
export const getEquipmentById = (id) => api.get(`/equipment/${id}`);
export const createEquipment = (payload) => api.post('/equipment', payload);
export const updateEquipment = (id, payload) => api.put(`/equipment/${id}`, payload);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);
