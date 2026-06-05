# ResumeAI — AI-Powered Career Platform

> Build ATS-optimized resumes, generate cover letters, match job descriptions, and publish portfolio websites — all powered by **free AI** (Groq + Gemini).

[![CI/CD](https://github.com/yourusername/resumeai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/resumeai/actions)
![License](https://img.shields.io/badge/license-MIT-green)
![Free AI](https://img.shields.io/badge/AI-Groq%20%2B%20Gemini%20(Free)-00C896)

---

## ✨ Features

| Feature | Free | Pro |
|---------|------|-----|
| Resume Builder (10-step wizard) | 3 resumes | Unlimited |
| AI Summary & Bullet Improver | 20/mo | Unlimited |
| ATS Score Engine (7 dimensions) | ✅ | ✅ Advanced |
| Cover Letter Generator | 3 | Unlimited |
| Job Match Engine (AI) | 5/mo | Unlimited |
| Interview Question Generator | 5 sessions | Unlimited |
| 1-Click Portfolio Website | 1 | Unlimited |
| Resume Templates | 3 | All 5 |
| Version History | ✗ | ✅ |
| PDF & DOCX Export | ✅ | ✅ |

---

## 🆓 Free AI Stack

The platform is built to run with **zero AI costs**:

| Provider | How to Get Free Key | Best For |
|----------|---------------------|----------|
| **Groq** | [console.groq.com](https://console.groq.com) → API Keys | Speed (14,400 req/day free) |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) → Get API Key | Quality (1M tokens/day free) |

Switch providers with a single env variable:
```env
AI_PROVIDER=GROQ           # Use Groq only
AI_PROVIDER=GEMINI         # Use Gemini only
AI_PROVIDER=GROQ_FALLBACK  # Try Groq, fallback to Gemini (recommended)
```

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router) + React 19
- **TypeScript** + Tailwind CSS
- **Framer Motion** — animations
- **Zustand** — global state
- **React Hook Form** + Zod — validation
- **TanStack Query** — server state
- **Recharts** — charts

### Backend
- **Node.js** + **Express.js** + TypeScript
- **MongoDB Atlas** (free M0 tier)
- **JWT** authentication (access + refresh tokens)
- **Helmet**, **rate-limit**, **HPP** — security
- **Winston** — structured logging

### Infrastructure (all free tiers)
- **Vercel** — frontend hosting
- **Render** — backend hosting
- **MongoDB Atlas M0** — database (512MB)
- **Cloudinary** — image/file storage
- **GitHub Actions** — CI/CD

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free)
- Groq API key (free) or Gemini API key (free)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/resumeai.git
cd resumeai

# Copy env files
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 2. Get Your Free API Keys

**Groq (Recommended — fastest)**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up free (no credit card)
3. Create an API key
4. Add to `.env`: `GROQ_API_KEY=gsk_...`

**Gemini (Best quality)**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key" → Create in new project
3. Add to `.env`: `GEMINI_API_KEY=AIza...`

### 3. Configure Environment

Edit `backend/.env`:
```env
AI_PROVIDER=GROQ_FALLBACK
GROQ_API_KEY=gsk_your_key_here
GEMINI_API_KEY=AIza_your_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumeai
JWT_ACCESS_SECRET=generate_64_char_random
JWT_REFRESH_SECRET=different_64_char_random
FRONTEND_URL=http://localhost:3000
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Install & Run

```bash
# Backend
cd backend
npm install
npm run dev   # starts on :5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev   # starts on :3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
resumeai/
├── .github/workflows/ci-cd.yml   # GitHub Actions CI/CD
├── .env.example                   # Environment template
├── backend/
│   └── src/
│       ├── index.ts               # Express server entry
│       ├── config/
│       │   ├── ai-config.ts       # AI provider config + prompts
│       │   └── database.ts        # MongoDB connection
│       ├── models/
│       │   ├── User.ts            # User schema + plan limits
│       │   └── Resume.ts          # Resume schema (10 sections)
│       ├── routes/
│       │   ├── auth.ts            # Register, login, Google, refresh
│       │   ├── resume.ts          # CRUD + auto-save
│       │   ├── ai.ts              # All AI endpoints
│       │   ├── ats.ts             # ATS scoring
│       │   ├── portfolio.ts       # Portfolio generation
│       │   ├── cover-letter.ts    # Cover letter saving
│       │   ├── export.ts          # PDF/DOCX export
│       │   └── admin.ts           # Admin panel APIs
│       ├── services/
│       │   ├── ai-provider.ts     # Groq + Gemini with fallback
│       │   └── ats-engine.ts      # Custom ATS scoring (no API)
│       └── middleware/
│           ├── auth.ts            # JWT protect middleware
│           └── freemium.ts        # Plan limit enforcement
└── frontend/
    ├── app/
    │   ├── page.tsx               # Landing page
    │   ├── dashboard/             # Main dashboard
    │   ├── resume/builder/        # 10-step resume wizard
    │   ├── ats/                   # ATS analyzer
    │   ├── cover-letter/          # Cover letter generator
    │   ├── interview-prep/        # Interview questions
    │   ├── job-match/             # Job description matching
    │   └── portfolio/[username]/  # Public portfolio page
    ├── components/
    │   ├── layout/Sidebar.tsx     # Navigation sidebar
    │   ├── resume/
    │   │   ├── builder/steps/     # 10 wizard steps
    │   │   ├── builder/LivePreview.tsx
    │   │   └── templates/         # 4 ATS-friendly templates
    │   └── providers/             # React Query provider
    ├── store/
    │   ├── auth-store.ts          # Zustand auth state
    │   └── resume-store.ts        # Resume builder state
    └── lib/
        └── api-client.ts          # Axios + token refresh
```

---

## 🔑 GitHub Actions Secrets

Add these in your repo → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `GROQ_API_KEY` | Your Groq API key |
| `VERCEL_TOKEN` | `vercel login` → Settings → Tokens |
| `RENDER_DEPLOY_HOOK` | Render → Service → Deploy Hook URL |
| `BACKEND_URL` | Your Render backend URL |
| `NEXT_PUBLIC_API_URL` | Backend API URL for builds |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## 🌐 Deployment

### Frontend → Vercel (Free)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Backend → Render (Free)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root directory to `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add environment variables from `.env`

### Database → MongoDB Atlas (Free M0)
1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create cluster (M0 Free)
2. Network Access → Add `0.0.0.0/0` for Render IPs
3. Create database user
4. Copy connection string to `MONGODB_URI`

---

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E
cd frontend && npm run test:e2e
```

---

## 🔒 Security Features

- JWT access tokens (15min) + refresh tokens (7 days)  
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min global, 20 auth req/hour)
- Helmet security headers
- MongoDB sanitization (NoSQL injection prevention)
- HPP (HTTP Parameter Pollution prevention)
- CORS with allowlist
- Input validation on every route (express-validator + Zod)
- Freemium plan enforcement middleware

---

## 📄 License

MIT © 2024 ResumeAI

---

Built with ❤️ using free AI. No paid OpenAI APIs were harmed in the making of this platform.
