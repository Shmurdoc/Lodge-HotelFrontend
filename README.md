# Frontend

This folder contains the frontend application (Vite + React + TypeScript).

## Local Quick Start

1. Copy the example env file:
   - `cp frontend/.env.example frontend/.env` (Mac/Linux)
   - `copy frontend\.env.example frontend\.env` (Windows)
2. Edit `frontend/.env` and replace the placeholders with your Supabase project URL and anon key.
   - You can get these from your Supabase project's API settings. Do NOT use the service_role key in the frontend.
3. Install dependencies:
   - `cd frontend`
   - `npm ci`
4. Start dev server:
   - `npm run dev`
5. Build for production:
   - `npm run build`

## Security Notes

- Do not commit `.env` to the repository. It is already in `.gitignore`.
- Never embed Supabase service_role keys or other secrets in client-side code.
- If you need server-side privileged operations, implement them in the backend.

## Branching & PR Recommendations

- Create a branch `feature/<area>/<short-desc>`, push changes, open a PR against `main`.
- Use the PR checklist to confirm local build passes and that env vars are not committed.

## Available Scripts

| Script | Description |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |