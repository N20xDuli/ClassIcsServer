import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 课程相关 API
export const courseApi = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (course) => api.post('/courses', course),
  update: (id, course) => api.put(`/courses/${id}`, course),
  delete: (id) => api.delete(`/courses/${id}`),
};

// 批量编辑相关 API
export const batchApi = {
  updateCourses: (courseIds, courseUpdate) => api.put('/batch/courses', { course_ids: courseIds, ...courseUpdate }),
  deleteCourses: (courseIds) => api.delete('/batch/courses', { data: { course_ids: courseIds } }),
};

// 用户相关 API
export const userApi = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
};

// ICS 相关 API
export const icsApi = {
  getSubscription: (userId) => api.get(`/ics/subscribe/${userId}`, { responseType: 'text' }),
};

export default api;
