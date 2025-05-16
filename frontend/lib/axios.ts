import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Add withCredentials if you're using cookies
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // プロフィール画像アップロード用の特別な設定
  if (config.url === '/profile/image' && config.method === 'post') {
    // Content-Typeはmultipart/form-dataの場合、ブラウザが自動的に設定するので削除
  if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);