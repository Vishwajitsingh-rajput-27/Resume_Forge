import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Something went wrong";
    if (err.response?.status === 401) {
      localStorage.removeItem("rf_token");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(msg));
  }
);

export const authAPI = {
  register:      (d) => api.post("/auth/register", d),
  login:         (d) => api.post("/auth/login", d),
  logout:        ()  => api.post("/auth/logout"),
  getMe:         ()  => api.get("/auth/me"),
  forgotPassword:(e) => api.post("/auth/forgot-password", { email: e }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

export const resumeAPI = {
  getAll:        ()       => api.get("/resume"),
  getOne:        (id)     => api.get(`/resume/${id}`),
  create:        (d)      => api.post("/resume", d),
  update:        (id, d)  => api.put(`/resume/${id}`, d),
  delete:        (id)     => api.delete(`/resume/${id}`),
  duplicate:     (id)     => api.post(`/resume/${id}/duplicate`),
  saveATSScore:  (id, s)  => api.put(`/resume/${id}/ats`, { score: s }),
};

export const aiAPI = {
  summary:     (d) => api.post("/ai/summary", d),
  skills:      (d) => api.post("/ai/skills", d),
  improve:     (d) => api.post("/ai/improve", d),
  atsTips:     (d) => api.post("/ai/ats-tips", d),
  projectDesc: (d) => api.post("/ai/project-desc", d),
};

export const userAPI = {
  getProfile:    ()  => api.get("/user/profile"),
  updateProfile: (d) => api.put("/user/profile", d),
  deleteAccount: ()  => api.delete("/user/account"),
};

export default api;
