# ResumeForge

ResumeForge is a free, full-stack career toolkit for building ATS-friendly resumes, tailoring applications, preparing for interviews, and publishing a portfolio.

[Open the live app](https://resume-forge-six-gamma.vercel.app/)

## What is included

- Guided 10-step resume builder with autosave
- Seven resume templates with color and typography controls
- PDF and DOCX export without watermarks
- ATS analysis and job-description matching
- AI-assisted summaries, bullet points, projects, cover letters, and interview questions
- Public portfolio pages
- Email/password and Google sign-in
- Password reset, profile settings, session refresh, and account deletion
- Responsive Shadcn-style UI across public, authentication, workspace, settings, and admin pages

There is no premium tier, checkout, paid template, or feature lock. Hosting and third-party AI/email providers can still apply fair-use, rate, or free-tier quotas.

## Architecture

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn-style components |
| State | Zustand, TanStack Query, React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose |
| Authentication | JWT access/refresh tokens, bcrypt, Google OAuth |
| AI | Groq and/or Google Gemini |
| Export | PDF, DOCX |
| Hosting | Vercel frontend, Render-compatible backend |

## Repository layout

```text
Resume_Forge/
├── frontend/   # Next.js application
├── backend/    # Express API
└── env.example.txt
```

## Local setup

Requirements:

- Node.js 20+
- npm
- MongoDB, local or Atlas

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files from `env.example.txt`. Backend variables belong in `backend/.env`; frontend `NEXT_PUBLIC_*` variables belong in `frontend/.env.local`.

Start both applications in separate terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`

Backend health: `http://localhost:5000/health`

## Required environment

Backend:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resumeforge
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=your-web-client.apps.googleusercontent.com
```

Frontend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-client.apps.googleusercontent.com
BACKEND_HEALTH_URL=http://localhost:5000/health
```

Use the same Google Web client ID on the frontend and backend. Add the frontend origin to that client's Authorized JavaScript origins in Google Cloud.

For AI tools, configure at least one provider:

```dotenv
AI_PROVIDER=GROQ
GROQ_API_KEY=your-key
```

or:

```dotenv
AI_PROVIDER=GEMINI
GEMINI_API_KEY=your-key
```

For production password-reset email:

```dotenv
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-user
EMAIL_PASS=your-password
EMAIL_FROM="ResumeForge <noreply@example.com>"
```

See [`env.example.txt`](env.example.txt) for the full list.

## Quality checks

Frontend:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Backend:

```bash
cd backend
npm run build
npm test
```

## Deployment

### Frontend on Vercel

- Import this GitHub repository.
- Set the project root directory to `frontend`.
- Track `main` as the production branch.
- Add the frontend environment variables before redeploying.

### Backend on Render

- Set the service root directory to `backend`.
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Add MongoDB, JWT, CORS, Google, email, and AI environment variables.
- Set `ALLOWED_ORIGINS` and `FRONTEND_URL` to the exact production frontend origin.

## Security notes

- Passwords are hashed with bcrypt.
- Refresh tokens are stored as hashes and rotate atomically.
- Google access tokens are checked against the configured audience in production.
- Password-reset responses avoid revealing whether an email is registered.
- Protected API resources are scoped to the authenticated user.
- Account deletion removes the user and their saved resumes.

## License

Add the license you want to use before redistributing the project.
