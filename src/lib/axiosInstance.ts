import axios from 'axios';
// https://greenfba.online
const axiosInstance = axios.create({
  baseURL: 'http://egwks4ws404k8wsoco00owgo.31.97.145.176.sslip.io',
  withCredentials: true,
});

export default axiosInstance;
