import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://edu-ai-backend-production-af44.up.railway.app/api';
console.log('🔗 Connecting to API:', apiUrl);

const API = axios.create({ baseURL: apiUrl });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eduai_token');
      localStorage.removeItem('eduai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
