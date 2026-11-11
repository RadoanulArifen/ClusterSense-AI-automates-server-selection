import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
};

export const dashboardAPI = {
  getStats:  () => api.get('/api/dashboard/stats'),
  getNodes:  () => api.get('/api/dashboard/nodes'),
  getTrends: () => api.get('/api/dashboard/metrics/trends'),
};

export const deploymentRequestsAPI = {
  list:   (status) => api.get('/api/deployment-requests/', { params: status ? { status } : {} }),
  create: (data)   => api.post('/api/deployment-requests/', data),
  get:    (id)     => api.get(`/api/deployment-requests/${id}`),
};

export const deploymentsAPI = {
  schedule: (requestId) => api.post('/api/deployments/schedule', { request_id: requestId }),
  deploy:   (data)      => api.post('/api/deployments/deploy', data),
  list:     ()          => api.get('/api/deployments/'),
};

export const predictionsAPI = {
  getAll:  ()       => api.get('/api/predictions/failure'),
  getNode: (nodeId) => api.get(`/api/predictions/failure/${nodeId}`),
};

export const alertsAPI = {
  list:        ()        => api.get('/api/alerts/'),
  acknowledge: (alertId) => api.patch(`/api/alerts/${alertId}/acknowledge`),
};

export const costAPI = {
  getRecommendations: () => api.get('/api/cost/recommendations'),
};

export const trustMeterAPI = {
  getSummary: () => api.get('/api/trust-meter/summary'),
};

export const outcomesAPI = {
  list: (params = {}) => api.get('/api/outcomes/', { params }),
};

export const planCompareAPI = {
  getLatest: () => api.get('/api/plan-compare/latest'),
};

export const simulationAPI = {
  run: (params) => api.post('/api/simulation/whatif', params),
};

export const copilotAPI = {
  chat: (message, context = {}) => api.post('/api/copilot/chat', { message, context }),
};

export default api;
