// src/api/api.js
import axios from "axios";


const BASE_URL = "https://blog-backend-production-b42f.up.railway.app/api";
// const BASE_URL = "http://localhost:8080/api";

const api = axios.create({ baseURL: BASE_URL });

// ── Attach JWT to every request ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("blog_token"); // ✅ fixed key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto logout on 401 ────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("blog_token");
      localStorage.removeItem("blog_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
// POST /api/auth/register  →  { token, userId, name, email }
// POST /api/auth/login     →  { token, userId, name, email }
export const authAPI = {
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },
};

// ── Posts ─────────────────────────────────────────────────────
// Spring Boot PostResponse shape:
// { id, title, excerpt, content, category, likes, featured,
//   createdAt, authorName, authorEmail, authorId }
export const postAPI = {
  getAll: async (category = null) => {
    const params = category ? { category } : {};
    const res = await api.get("/posts", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },
  getMyPosts: async () => {
    const res = await api.get("/posts/my");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/posts", data);
    return res.data;
  },
  like: async (id) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },
  delete: async (id) => {
    await api.delete(`/posts/${id}`);
  },
};

export default api;