import axios from "axios";

const configuredApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const API = axios.create({
  baseURL: `${configuredApiUrl}/api`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("photo_studio_token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
