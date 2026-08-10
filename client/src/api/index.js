import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Interceptor to add Authorization Bearer token to headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized access
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getMe: () => API.get('/auth/me'),
};

export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
};

export const unitAPI = {
  getAll: (params) => API.get('/units', { params }),
  getById: (id) => API.get(`/units/${id}`),
  getAvailability: (id) => API.get(`/units/${id}/availability`),
  create: (data) => API.post('/units', data),
  update: (id, data) => API.put(`/units/${id}`, data),
  delete: (id) => API.delete(`/units/${id}`),
};

export const eventAPI = {
  getAll: () => API.get('/events'),
  getById: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
};

export const borrowingAPI = {
  create: (data) => API.post('/borrowings', data),
  getAll: (params) => API.get('/borrowings', { params }),
  getMy: () => API.get('/borrowings/my'),
  processReturn: (id) => API.put(`/borrowings/${id}/return`),
  cancel: (id) => API.put(`/borrowings/${id}/cancel`),
  getReport: (params) => API.get('/borrowings/report', { params }),
};

export default API;
