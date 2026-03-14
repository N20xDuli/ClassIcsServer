import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 课程相关 API
export const courseApi = {
  getAll: (majorId) => api.get('/courses/', { params: { major_id: majorId } }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (course) => api.post('/courses/', course),
  update: (id, course) => api.put(`/courses/${id}`, course),
  delete: (id) => api.delete(`/courses/${id}`),
};

// 专业相关 API
export const majorApi = {
  getAll: () => api.get('/majors/'),
  getOne: (id) => api.get(`/majors/${id}`),
  create: (major) => api.post('/majors/', major),
  update: (id, major) => api.put(`/majors/${id}`, major),
  delete: (id) => api.delete(`/majors/${id}`),
};

// 批量编辑相关 API
export const batchApi = {
  updateCourses: (courseIds, courseUpdate) => api.put('/batch/courses/', { course_ids: courseIds, ...courseUpdate }),
  deleteCourses: (courseIds) => api.delete('/batch/courses/', { data: { course_ids: courseIds } }),
};

// 教室查询相关 API
export const classroomApi = {
  queryAvailable: (params) => api.get('/classroom/available/', { params }),
};

// 用户相关 API
export const userApi = {
  getAll: () => api.get('/users/'),
  getOne: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users/', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`),
};

// ICS 相关 API
export const icsApi = {
  getSubscription: (userId, majorId) => api.get(`/ics/subscribe/${userId}`, { 
    params: { major_id: majorId },
    responseType: 'text' 
  }),
  getMajorSubscription: (majorId) => api.get(`/ics/majors/${majorId}/subscribe`, { responseType: 'text' }),
};

export default api;
