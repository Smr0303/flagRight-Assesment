import axios from 'axios';

axios.defaults.withCredentials = true;

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;