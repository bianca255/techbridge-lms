import api from './api';

// Auth endpoints
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout')
};

// Course endpoints
export const courseService = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/my/enrolled'),
  getTeacherCourses: () => api.get('/courses/my/teaching'),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => api.post(`/courses/${id}/unenroll`),
  addReview: (id, data) => api.post(`/courses/${id}/review`, data)
};

// Lesson endpoints
export const lessonService = {
  getLessonsByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (data) => api.post('/lessons', data),
  updateLesson: (id, data) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  completeLesson: (id, data) => api.post(`/lessons/${id}/complete`, data)
};

// Quiz endpoints
export const quizService = {
  getQuizzesByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (id, data) => api.put(`/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  submitQuiz: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getQuizAttempts: (id) => api.get(`/quizzes/${id}/attempts`)
};

// Forum endpoints
export const forumService = {
  getForumsByCourse: (courseId, params) => api.get(`/forums/course/${courseId}`, { params }),
  getForum: (id) => api.get(`/forums/${id}`),
  createForum: (data) => api.post('/forums', data),
  updateForum: (id, data) => api.put(`/forums/${id}`, data),
  deleteForum: (id) => api.delete(`/forums/${id}`),
  addReply: (id, data) => api.post(`/forums/${id}/reply`, data),
  likeForum: (id) => api.post(`/forums/${id}/like`),
  likeReply: (id, replyId) => api.post(`/forums/${id}/reply/${replyId}/like`)
};

// Progress endpoints
export const progressService = {
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  getMyProgress: () => api.get('/progress/my'),
  getDashboardStats: () => api.get('/progress/dashboard'),
  getLeaderboard: (params) => api.get('/progress/leaderboard', { params }),
  getCourseAnalytics: (courseId) => api.get(`/progress/analytics/course/${courseId}`),
  getStudentAnalytics: (studentId) => api.get(`/progress/analytics/student/${studentId}`)
};

// User endpoints
export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats')
};

// Certificate services
export const certificateService = {
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  downloadCertificate: (courseId) => api.get(`/certificates/${courseId}`, { 
    responseType: 'blob' 
  }),
  verifyCertificate: (certificateId) => api.get(`/certificates/verify/${certificateId}`)
};
