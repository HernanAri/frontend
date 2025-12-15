// src/config.js

// Vite expone las variables de entorno que empiezan con VITE_
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 Configuración:', {
    API_URL,
    MODE: import.meta.env.MODE,
  });
}

export default {
  API_URL,
};