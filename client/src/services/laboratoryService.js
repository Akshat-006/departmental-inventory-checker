import api from './api.js';

export const getLaboratories = (params = {}) => api.get('/laboratories', { params });
export const getLaboratoryById = (id) => api.get(`/laboratories/${id}`);
export const createLaboratory = (payload) => api.post('/laboratories', payload);
export const updateLaboratory = (id, payload) => api.put(`/laboratories/${id}`, payload);
export const deleteLaboratory = (id) => api.delete(`/laboratories/${id}`);
