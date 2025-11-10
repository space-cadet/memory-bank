import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const documentAPI = {
  getAll: () => api.get('/documents'),
  getChronological: () => api.get('/documents/chronological'),
  getChronologicalGrouped: () => api.get('/documents/chronological-grouped'),
  getById: (id) => api.get(`/documents/${id}`)
};

export const taskAPI = {
  getAll: () => api.get('/tasks'),
  getDocuments: (taskId) => api.get(`/tasks/${taskId}/documents`)
};

export const topicAPI = {
  getAll: () => api.get('/topics'),
  getDocuments: (topic) => api.get(`/topics/${encodeURIComponent(topic)}/documents`)
};

export const searchAPI = {
  search: (query) => api.get('/search', { params: { q: query } })
};

export default api;
