import axios from "axios";

const baseURL = "https://codexa-h1wt.onrender.com/api";

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
  const token = localStorage.getItem("token");

  // Skip attaching token for login/register
  if (
    token &&
    !config.url.includes("/login") &&
    !config.url.includes("/register")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (
        status === 401 &&
        data.message === "Token expired, please login again"
      ) {
        console.warn(
          "Token expiration detected but ignoring due to system date issue"
        );
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
