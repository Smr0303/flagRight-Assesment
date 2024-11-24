import axios from "axios";

axios.defaults.withCredentials = true;

const apiUrl = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
