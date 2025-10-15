import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Payment methods
  createPaymentOrder: async (farmerId) => {
    const response = await axiosInstance.post('/payment/create-order', { farmerId });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payment/verify', paymentData);
    return response.data;
  },

  getPaymentDetails: async (paymentId) => {
    const response = await axiosInstance.get(`/payment/${paymentId}`);
    return response.data;
  },
  // Auth methods
  login: async (username, password) => {
    const response = await axiosInstance.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  // Create new farmer registration
  createFarmer: async (farmerData) => {
    const response = await axios.post(`${API_URL}/farmers`, farmerData);
    return response.data;
  },

  // Get all farmers with pagination and filters
  getFarmers: async (page = 1, limit = 10, status = 'all', search = '') => {
    const response = await axios.get(`${API_URL}/farmers`, {
      params: { page, limit, status, search }
    });
    return response.data;
  },

  // Update farmer status
  updateFarmerStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/farmers/${id}`, { status });
    return response.data;
  },

  // Get farmer by ID
  getFarmerById: async (id) => {
    const response = await axios.get(`${API_URL}/farmers/${id}`);
    return response.data;
  },

  // Delete farmer
  deleteFarmer: async (id) => {
    const response = await axios.delete(`${API_URL}/farmers/${id}`);
    return response.data;
  }
};