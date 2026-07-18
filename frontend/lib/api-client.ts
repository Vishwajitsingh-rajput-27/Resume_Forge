import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';
const AUTH_STORAGE_KEY = 'resumeai-auth';

type TokenPair = {
  accessToken: string | null;
  refreshToken: string | null;
};

type PersistedAuth = {
  state?: {
    accessToken?: string | null;
    refreshToken?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

let syncAuthTokens: ((tokens: TokenPair) => void) | null = null;

export const registerAuthTokenSync = (
  callback: (tokens: TokenPair) => void,
) => {
  syncAuthTokens = callback;
};

const readPersistedAuth = (): PersistedAuth | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as PersistedAuth : null;
  } catch {
    return null;
  }
};

const persistTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  const persisted = readPersistedAuth() || { state: {} };
  persisted.state = {
    ...(persisted.state || {}),
    accessToken,
    refreshToken,
  };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persisted));
  syncAuthTokens?.({ accessToken, refreshToken });
};

const clearPersistedAuth = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  delete api.defaults.headers.common.Authorization;
  syncAuthTokens?.({ accessToken: null, refreshToken: null });
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) => {
  const response = (error as {
    response?: {
      data?: {
        error?: string;
        message?: string;
        errors?: Array<{ msg?: string }>;
      };
    };
  })?.response;

  return response?.data?.error
    || response?.data?.errors?.[0]?.msg
    || response?.data?.message
    || fallback;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = readPersistedAuth()?.state?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  queue.forEach((pending) => {
    if (token) pending.resolve(token);
    else pending.reject(error);
  });
  queue = [];
};

const publicAuthEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const isPublicAuthRequest = (url?: string) => {
  if (!url) return false;
  const path = url.split('?')[0].replace(API_BASE_URL, '');
  return publicAuthEndpoints.some((endpoint) => path.endsWith(endpoint));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      !original
      || error.response?.status !== 401
      || original._retry
      || isPublicAuthRequest(original.url)
      || typeof window === 'undefined'
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      original._retry = true;
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const persisted = readPersistedAuth();
      const refreshToken = persisted?.state?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token is available.');

      const { data } = await axios.post<{
        accessToken: string;
        refreshToken?: string;
      }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

      const nextRefreshToken = data.refreshToken || refreshToken;
      persistTokens(data.accessToken, nextRefreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

      processQueue(null, data.accessToken);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearPersistedAuth();
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.assign('/auth/login');
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const aiApi = {
  improveSummary: (
    summary: string,
    role: string,
    style: 'concise' | 'standard' | 'detailed' = 'standard',
  ) => api.post('/ai/improve-summary', { summary, role, style }),
  improveBullet: (responsibility: string, role: string) =>
    api.post('/ai/improve-bullet', { responsibility, role }),
  skillSuggestions: (domain: string) =>
    api.post('/ai/skill-suggestions', { domain }),
  improveProject: (description: string, tech: string) =>
    api.post('/ai/improve-project', { description, tech }),
  coverLetter: (params: object) => api.post('/ai/cover-letter', params),
  interviewQuestions: (role: string, skills: string[], level: string) =>
    api.post('/ai/interview-questions', { role, skills, level }),
  jobMatch: (resumeText: string, jobDescription: string) =>
    api.post('/ai/job-match', { resumeText, jobDescription }),
  ping: () => api.get('/ai/ping'),
};

export const resumeApi = {
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  create: (data: object) => api.post('/resumes', data),
  update: (id: string, data: object) => api.put(`/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  getATS: (id: string) => api.get(`/ats/${id}`),
  export: (id: string, format: 'pdf' | 'docx') =>
    api.get(`/export/${id}?format=${format}`, { responseType: 'blob' }),
};

export const portfolioApi = {
  generate: (resumeId: string) => api.post('/portfolios/generate', { resumeId }),
  getByUsername: (username: string) => api.get(`/portfolios/${username}`),
  update: (id: string, data: object) => api.put(`/portfolios/${id}`, data),
};

export default api;
