import axios from 'axios';

const api = axios.create({
  // In development (localhost), use '/api' to trigger Vite's proxy.
  // In production (Vercel), hit the deployed backend directly.
  baseURL: import.meta.env.MODE === 'production' 
    ? 'https://paytm-hacks.vercel.app/api' 
    : '/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for errors (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
