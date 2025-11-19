import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous logout attempts
let isLoggingOut = false;

// Response interceptor untuk handle error dan refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Jangan intercept requests yang tidak menggunakan auth token
    // (login/register tidak pakai token)
    if (!config?.headers?.Authorization) {
      return Promise.reject(error);
    }

    if (response?.status === 401 || response?.status === 403) {
      // Token expired or invalid, coba refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, logout
          if (isLoggingOut) {
            return Promise.reject(error);
          }
          isLoggingOut = true;
          window.dispatchEvent(new CustomEvent('auth:expired'));
          return Promise.reject(error);
        }

        // Try to refresh token - use axios directly to avoid interceptors
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });

        if (refreshResponse.status === 200) {
          const { accessToken } = refreshResponse.data;

          // Save new access token
          localStorage.setItem('authToken', accessToken);

          // Retry original request dengan token baru
          config.headers.Authorization = `Bearer ${accessToken}`;
          return api(config);
        }
      } catch (refreshError) {
        if (import.meta.env.DEV) {
          console.error('Token refresh failed:', refreshError);
        }

        // Check if already logging out to prevent multiple redirects/alerts
        if (isLoggingOut) {
          return Promise.reject(error);
        }

        // Set flag to prevent multiple logout attempts
        isLoggingOut = true;

        // Refresh failed, logout user
        console.log('Token refresh failed, logging out user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
