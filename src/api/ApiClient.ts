import axios from 'axios';

const apiCliente = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, 
});

export default apiCliente;