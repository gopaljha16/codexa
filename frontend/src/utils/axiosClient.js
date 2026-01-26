import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

if (!baseURL) {
  throw new Error("API base URL is not defined");
}

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      // Temporarily disable automatic logout for token expiration
      // This is a workaround for the system date issue (2025)
      if (status === 401 && data.message === "Token expired, please login again") {
        console.warn("Token expiration detected but ignoring due to system date issue");
        // Don't clear user session or redirect
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
