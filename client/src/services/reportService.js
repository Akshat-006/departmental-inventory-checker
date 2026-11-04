import api from './api.js';

export const getReports = () => api.get('/reports');
export const exportCsv = (type = 'inventory') => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/reports/csv?type=${type}`, '_blank');
