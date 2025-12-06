import axios from 'axios';

// Railway backend URL - Replace with your actual Railway backend URL
// Get this from: Railway → Backend Service → Settings → Networking → Domain
const RAILWAY_BACKEND_URL = 'https://quanlybenhvien-production-f8ea.up.railway.app/api';

// Use VITE_API_URL if set, otherwise use Railway URL in production, localhost in dev
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? RAILWAY_BACKEND_URL : 'http://localhost:5050/api');
console.log("🚀 ~ API_BASE:", API_BASE)

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Log API base for debugging
console.log('🌐 API Base URL:', API_BASE);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

