import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // URL do seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;