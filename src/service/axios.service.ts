import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = import.meta.env.VITE_BASE_URL ?? "https://api.example.com";

const axiosClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔴 RESPONSE: 401 bo‘lsa tokenni o‘chir
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Tokenni o‘chir
      localStorage.removeItem("admin_user"); // Admin userini o'chir
      // Admin sahifasida bo'lsa admin loginga, aks holda user loginga otsinda
      const isAdminRoute = window.location.pathname.startsWith('/admin') || 
                           window.location.pathname === '/' ||
                           localStorage.getItem('admin_user');
      window.location.href = isAdminRoute ? "/admin/login" : "/signin";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
