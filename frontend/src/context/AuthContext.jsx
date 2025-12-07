import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios.config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Configurar el token en axios
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Limpiar cualquier sesión previa antes de iniciar sesión
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Hacer la petición de login con la ruta correcta: /autenticador/login
      const response = await axiosInstance.post('/autenticador/login', { 
        username, 
        password 
      });
      
      const data = response.data;

      // Guardar en localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Configurar axios
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

      // Actualizar el estado
      setToken(data.access_token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');

    // Limpiar header de axios
    delete axiosInstance.defaults.headers.common['Authorization'];


    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};