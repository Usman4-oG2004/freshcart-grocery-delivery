import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('freshcart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('freshcart_token');
      Toast.show({
        type: 'error',
        text1: 'Session expired',
        text2: 'Please login again.',
      });
    }
    return Promise.reject(error);
  }
);

export default api;
