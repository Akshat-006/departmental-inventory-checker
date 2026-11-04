import api from './api.js';

export const getTransactions = (params = {}) => api.get('/transactions', { params });
export const getTransactionById = (id) => api.get(`/transactions/${id}`);
export const createTransaction = (payload) => api.post('/transactions', payload);
export const approveTransaction = (id) => api.patch(`/transactions/${id}/approve`);
export const issueTransaction = (id) => api.patch(`/transactions/${id}/issue`);
export const returnTransaction = (id) => api.patch(`/transactions/${id}/return`);
