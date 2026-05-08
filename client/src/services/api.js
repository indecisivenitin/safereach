
// import axios from 'axios';

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL ||
//     'http://localhost:5000/api',

//   timeout: 15000,
// });

// // =========================
// // Attach token automatically
// // =========================
// api.interceptors.request.use(
//   (config) => {
//     const token =
//       localStorage.getItem('token');

//     if (token) {
//       config.headers.Authorization =
//         `Bearer ${token}`;
//     }

//     return config;
//   }
// );

// // =========================
// // Handle 401 globally
// // =========================
// api.interceptors.response.use(
//   (res) => res,

//   (error) => {
//     if (
//       error.response?.status === 401
//     ) {
//       localStorage.removeItem('token');

//       window.location.href =
//         '/login';
//     }

//     return Promise.reject(
//       error.response?.data || error
//     );
//   }
// );

// export default api;

// // =========================
// // Auth Services
// // =========================
// export const authService = {

//   // Registration with webcam selfie
//   // and Aadhaar support
//   register: (data) =>
//     api.post(
//       '/auth/register',
//       data,
//       {
//         headers: {
//           'Content-Type':
//             'multipart/form-data',
//         },
//       }
//     ),

//   login: (data) =>
//     api.post('/auth/login', data),

//   getMe: () =>
//     api.get('/auth/me'),

//   updateProfile: (data) =>
//     api.put('/auth/me', data),

//   updateFcmToken: (token) =>
//     api.patch(
//       '/auth/fcm-token',
//       {
//         fcmToken: token,
//       }
//     ),
// };

// // =========================
// // Alert Services
// // =========================
// export const alertService = {

//   create: (data) =>
//     api.post('/alerts', data),

//   getMy: (params) =>
//     api.get('/alerts/my', {
//       params,
//     }),

//   accept: (id) =>
//     api.put(
//       `/alerts/${id}/accept`
//     ),

//   decline: (id) =>
//     api.put(
//       `/alerts/${id}/decline`
//     ),

//   resolve: (id) =>
//     api.put(
//       `/alerts/${id}/resolve`
//     ),

//   cancel: (id) =>
//     api.put(
//       `/alerts/${id}/cancel`
//     ),

//   getNearby: () =>
//     api.get('/alerts/nearby'),
// };

// // =========================
// // Volunteer Services
// // =========================
// export const volunteerService = {

//  updateLocation: async (data) => {

//   const response = await api.put(
//     '/volunteers/location',
//     data
//   );

//   return response.data;
// },
//   toggleStatus: (isActive) =>
//     api.patch(
//       '/volunteers/status',
//       { isActive }
//     ),

//   getStats: () =>
//     api.get('/volunteers/stats'),

//   getLeaderboard: () =>
//     api.get(
//       '/volunteers/leaderboard'
//     ),
// };

// // =========================
// // Review Services
// // =========================
// export const reviewService = {

//   create: (data) =>
//     api.post('/reviews', data),

//   getForVolunteer: (id) =>
//     api.get(
//       `/reviews/volunteer/${id}`
//     ),
// };






import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',

  timeout: 15000,
});

// =========================
// Attach token automatically
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// =========================
// Handle 401 globally
// =========================
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

// =========================
// Auth Services
// =========================
export const authService = {

  register: (data) =>
    api.post('/auth/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  login: (data) =>
    api.post('/auth/login', data),

  getMe: () =>
    api.get('/auth/me'),

  updateProfile: (data) =>
    api.put('/auth/me', data),

  updateFcmToken: (token) =>
    api.patch('/auth/fcm-token', { fcmToken: token }),
};

// =========================
// Alert Services
// =========================
export const alertService = {

  create: (data) =>
    api.post('/alerts', data),

  getById: (id) =>
    api.get(`/alerts/${id}`),   // ← ADDED

  getMy: (params) =>
    api.get('/alerts/my', { params }),

  accept: (id) =>
    api.put(`/alerts/${id}/accept`),

  decline: (id) =>
    api.put(`/alerts/${id}/decline`),

  resolve: (id) =>
    api.put(`/alerts/${id}/resolve`),

  cancel: (id) =>
    api.put(`/alerts/${id}/cancel`),

  getNearby: () =>
    api.get('/alerts/nearby'),
};

// =========================
// Volunteer Services
// =========================
export const volunteerService = {

  updateLocation: async (data) => {
    const response = await api.put('/volunteers/location', data);
    return response.data;
  },

  toggleStatus: (isActive) =>
    api.patch('/volunteers/status', { isActive }),

  getStats: () =>
    api.get('/volunteers/stats'),

  getLeaderboard: () =>
    api.get('/volunteers/leaderboard'),
};

// =========================
// Review Services
// =========================
export const reviewService = {

  create: (data) =>
    api.post('/reviews', data),

  getForVolunteer: (id) =>
    api.get(`/reviews/volunteer/${id}`),
};