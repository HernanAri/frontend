import axiosInstance from './axios.config';

export const authAPI = {
  login: async (username, password) => {
    const { data } = await axiosInstance.post('/autenticador/login', {
      username,
      password,
    });
    return data;
  },
};

export const qrAPI = {
  verifyToken: async (token) => {
    const { data } = await axiosInstance.post('/qrcode/verify', { token });
    return data;
  },
};

export const sessionAPI = {
  startSession: async (token) => {
    const { data } = await axiosInstance.post('/registro/entrada', { token });
    return data;
  },
  
  endSession: async (token) => {
    const { data } = await axiosInstance.post('/registro/salida', { token });
    return data;
  },
  
  getUserSessions: async (idusuario) => {
    const { data } = await axiosInstance.get(`/registro/sesiones/${idusuario}`);
    return data;
  },
  
  getWeeklySummary: async (idusuario) => {
    const { data } = await axiosInstance.get(`/registro/resumen/${idusuario}`);
    return data;
  },
};

export const userAPI = {
  getAllUsers: async () => {
    const { data } = await axiosInstance.get('/usuario');
    return data;
  },
};