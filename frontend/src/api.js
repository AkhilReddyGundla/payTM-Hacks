import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied to localhost:5000 in dev
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
