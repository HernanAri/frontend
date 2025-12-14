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
  // ✅ AGREGADO: Login con QR
  login: async (token) => {
    const { data } = await axiosInstance.post('/qrcode/login', { token });
    return data;
  },
  
  verifyToken: async (token) => {
    const { data } = await axiosInstance.post('/qrcode/verify', { token });
    return data;
  },
  
  // ✅ AGREGADO: Obtener info del usuario desde QR
  getUserInfo: async (token) => {
    const { data } = await axiosInstance.post('/qrcode/info', { token });
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
  
  // ✅ AGREGADO: Iniciar sesión por ID de usuario
  startSessionById: async (idusuario) => {
    const { data } = await axiosInstance.post('/registro/entrada-directa', { idusuario });
    return data;
  },
};

export const userAPI = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    const { data } = await axiosInstance.get('/usuario');
    return data;
  },
  
  // Obtener un usuario por ID
  getUserById: async (idusuario) => {
    const { data } = await axiosInstance.get(`/usuario/${idusuario}`);
    return data;
  },
  
  // Crear un nuevo usuario
  createUser: async (userData) => {
    const { data } = await axiosInstance.post('/usuario', {
      idusuario: userData.idusuario || Date.now(),
      nombre: userData.nombre,
      documento: userData.documento,
      cargo: userData.cargo || 'Empleado',
      vehiculo: userData.vehiculo || 'Ninguno',
      matricula: userData.matricula || 'N/A',
      RH: userData.RH || 'O+',
      correo: userData.correo,
      direccion: userData.direccion || 'N/A',
      celular: userData.celular,
      elementos: userData.elementos || 'N/A',
      rol: userData.rol || 'usuario',
      username: userData.username,
      password: userData.password,
    });
    return data;
  },
  
  // Actualizar un usuario existente
  updateUser: async (idusuario, userData) => {
    const payload = {
      rol: userData.rol,
      username: userData.username,
      email: userData.email || userData.correo,
    };
    
    // Solo incluir password si se proporcionó
    if (userData.password && userData.password.trim() !== '') {
      payload.password = userData.password;
    }
    
    const { data } = await axiosInstance.put(`/usuario/${idusuario}`, payload);
    return data;
  },
  
  deleteUser: async (idusuario) => {
    const { data } = await axiosInstance.delete(`/usuario/${idusuario}`);
    return data;
  },
};