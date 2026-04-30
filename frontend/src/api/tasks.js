import api from './client';

export const getTasks = (projectId) => api.get('/tasks', { params: projectId ? { projectId } : {} });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getDeletionHistory = () => api.get('/tasks/history');
export const getStats = () => api.get('/tasks/stats');
