import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

let getTokenFn: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      console.log("JWT Token:", token)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Auth header set ✅");
      } else {
        console.warn("No token available ⚠️");
      }
    } catch (err) {
      console.error("Error getting token:", err);
    }
  } else {
    console.warn("No token getter registered ⚠️");
  }
  return config;
});

export default api;