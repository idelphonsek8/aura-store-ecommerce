import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL: API_BASE_URL });

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem("aura_tokens") || "null");
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (tokens) localStorage.setItem("aura_tokens", JSON.stringify(tokens));
  else localStorage.removeItem("aura_tokens");
}

client.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const tokens = getTokens();
      if (!tokens?.refresh) {
        setTokens(null);
        return Promise.reject(error);
      }
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: tokens.refresh,
        });
        const newTokens = { ...tokens, access: data.access };
        setTokens(newTokens);
        client.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        queue.forEach(({ resolve, original: o }) => {
          o.headers.Authorization = `Bearer ${data.access}`;
          resolve(client(o));
        });
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch (refreshError) {
        setTokens(null);
        queue.forEach(({ reject: rej }) => rej(refreshError));
        queue = [];
        window.location.href = "/connexion";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
