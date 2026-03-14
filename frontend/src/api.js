import axios from 'axios';

const API = axios.create({ baseURL: window.location.hostname === 'localhost' ? '/api' : 'https://edu-ai.vercel.app/api' });

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
