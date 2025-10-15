// Get the base URL based on environment
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default URLs based on environment
  if (import.meta.env.PROD) {
    // Use live Render backend URL in production
    return 'https://farmform.onrender.com/api';
  }
  return 'https://farmform.onrender.com/api';
};

// Axios instance with environment-specific config
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle production CORS
axiosInstance.interceptors.request.use((config) => {
  if (import.meta.env.PROD) {
    // Ensure cookies and credentials work in production
    config.withCredentials = true;
  }
  return config;
});