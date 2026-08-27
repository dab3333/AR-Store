import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const client = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every outgoing request, if present.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("arstore_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to /login on 401 responses (expired/invalid token), except for
// the auth endpoints themselves where a 401 is an expected "bad credentials".
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("arstore_token");
      localStorage.removeItem("arstore_username");
      localStorage.removeItem("arstore_role");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
