import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: { headers: any; }) => {
    // Guard access to localStorage for SSR environments
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      if (!config.headers) config.headers = {} as any;
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: { config: any; response: { status: number; data: { code: string; }; }; }) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (refreshToken) {
          // TODO: Implement token refresh endpoint
          // const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          // if (typeof window !== 'undefined') {
          //   localStorage.setItem('accessToken', data.accessToken);
          // }
          // return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },
};

// User API calls
export const userAPI = {
  getCredits: async () => {
    const { data } = await apiClient.get('/user/credits');
    return data;
  },

  checkFeatureAccess: async (feature: string) => {
    const { data } = await apiClient.get(`/user/features/${feature}`);
    return data;
  },

  upgradePlan: async (plan: 'Basic' | 'Premium') => {
    const { data } = await apiClient.post('/user/upgrade-plan', { plan });
    return data;
  },
};

// Card API calls
export const cardAPI = {
  generate: async (cardData: { card_type: string; source_url: string; theme?: string; is_batch?: boolean; batch_count?: number }) => {
    const { data } = await apiClient.post('/cards/generate', cardData);
    return data;
  },

  checkLimit: async () => {
    const { data } = await apiClient.get('/cards/check-limit');
    return data;
  },
};

// Admin API calls
export const adminAPI = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string; plan?: string; status?: string }) => {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  getUser: async (userId: string) => {
    const { data } = await apiClient.get(`/admin/users/${userId}`);
    return data;
  },

  updateUserPlan: async (userId: string, plan: 'Free' | 'Basic' | 'Premium') => {
    const { data } = await apiClient.put(`/admin/users/${userId}/plan`, { plan });
    return data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'suspended' | 'deleted') => {
    const { data } = await apiClient.put(`/admin/users/${userId}/status`, { status });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/admin/stats');
    return data;
  },
};

export default apiClient;
