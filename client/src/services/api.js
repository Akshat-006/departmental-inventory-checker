import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.startsWith('/auth/');

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      window.location.pathname !== '/login'
    ) {
      window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
