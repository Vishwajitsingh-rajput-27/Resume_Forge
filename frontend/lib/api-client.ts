import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('resumeai-auth');
      const state = raw ? JSON.parse(raw) : null;
      const token = state?.state?.accessToken;
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// On 401, attempt silent token refresh once
let isRefreshing = false;
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers['Authorization'] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const raw = localStorage.getItem('resumeai-auth');
      const state = raw ? JSON.parse(raw) : null;
      const refreshToken = state?.state?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken }
      );

      // Patch localStorage
      state.state.accessToken = data.accessToken;
      localStorage.setItem('resumeai-auth', JSON.stringify(state));

      processQueue(null, data.accessToken);
      original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      // Clear auth state on refresh failure
      localStorage.removeItem('resumeai-auth');
      window.location.href = '/auth/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Typed helpers ────────────────────────────────────────────────────────────
export const aiApi = {
  improveSummary:  (summary: string, role: string)     => api.post('/ai/improve-summary', { summary, role }),
  improveBullet:   (responsibility: string, role: string) => api.post('/ai/improve-bullet', { responsibility, role }),
  skillSuggestions:(domain: string)                    => api.post('/ai/skill-suggestions', { domain }),
  improveProject:  (description: string, tech: string) => api.post('/ai/improve-project', { description, tech }),
  coverLetter:     (params: object)                    => api.post('/ai/cover-letter', params),
  interviewQuestions:(role: string, skills: string[], level: string) => api.post('/ai/interview-questions', { role, skills, level }),
  jobMatch:        (resumeText: string, jobDescription: string) => api.post('/ai/job-match', { resumeText, jobDescription }),
  ping:            ()                                  => api.get('/ai/ping'),
};

export const resumeApi = {
  getAll:   ()                    => api.get('/resumes'),
  getById:  (id: string)          => api.get(`/resumes/${id}`),
  create:   (data: object)        => api.post('/resumes', data),
  update:   (id: string, data: object) => api.put(`/resumes/${id}`, data),
  delete:   (id: string)          => api.delete(`/resumes/${id}`),
  getATS:   (id: string)          => api.get(`/ats/${id}`),
  export:   (id: string, fmt: 'pdf' | 'docx') => api.get(`/export/${id}?format=${fmt}`, { responseType: 'blob' }),
};

export const portfolioApi = {
  generate: (resumeId: string)    => api.post('/portfolios/generate', { resumeId }),
  getByUsername: (username: string) => api.get(`/portfolios/${username}`),
  update:   (id: string, data: object) => api.put(`/portfolios/${id}`, data),
};

export default api;
