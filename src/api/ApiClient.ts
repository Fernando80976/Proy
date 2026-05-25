import axios from 'axios';

const apiCliente = axios.create({
  // Usamos la variable de entorno de Vite
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 8 segundos máximo de espera
});

export default apiCliente;