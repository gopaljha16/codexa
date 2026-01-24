import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL;

if (baseURL === undefined) {
  throw new Error("VITE_API_URL is not defined in environment variables");
}

const axiosClient = axios.create({
    baseURL: baseURL || "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});



axiosClient.interceptors.request.use((config) => {
  // Prefer 'authToken' but support legacy 'token'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Add response interceptor to handle token expiration
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && (data?.message?.toLowerCase()?.includes('expired') || data?.message === 'Session expired')) {
        // Clear any stale tokens so login works cleanly
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          // Keep 'user' intact until app state updates
        } catch {}
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
