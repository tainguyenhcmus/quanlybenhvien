import axios from 'axios';

// Railway backend URL - Replace with your actual Railway backend URL
// Get this from: Railway → Backend Service → Settings → Networking → Domain
const RAILWAY_BACKEND_URL = 'https://quanlybenhvien-production-f8ea.up.railway.app/api';

// Determine API base URL
// Priority: 1. VITE_API_URL env var, 2. Railway URL if not localhost, 3. localhost for dev
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on Vercel or production (not localhost), use Railway
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return RAILWAY_BACKEND_URL;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5050/api';
};

const API_BASE = getApiBase();
console.log("🚀 ~ API_BASE:", API_BASE);
console.log("🚀 ~ Hostname:", window.location.hostname);

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Log API base for debugging
console.log('🌐 API Base URL:', API_BASE);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

