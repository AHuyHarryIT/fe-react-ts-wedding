import { logError } from '@utils/error';
import axios from 'axios';

const MOMO_API_URL =
  import.meta.env.VITE_MOMO_API_URL || 'https://test-payment.momo.vn';

export const momoApi = axios.create({
  baseURL: MOMO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

momoApi.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

momoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
