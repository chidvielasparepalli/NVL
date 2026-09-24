# NOVAL

Private gothic novel writing room.

## Architecture

- Frontend: Next.js + TypeScript + Tailwind → Vercel
- Backend: Express + TypeScript → Render
- Database: Render Postgres
- Auth: email/password + bcrypt + JWT httpOnly cookie
- Editor: Tiptap
- Synonyms: Datamuse
- Voice: browser Web Speech API
- Translation: MyMemory

Google OAuth is intentionally not used.

## Local

Backend requires PostgreSQL.

    cd backend
    copy .env.example .env
    npm install
    npx prisma generate
    npx prisma db push
    npm run dev

Frontend:

    copy .env.example .env.local
    npm install
    npm run dev

Open http://localhost:3000.

## Render

The repository contains render.yaml. Create a Render Blueprint from the repo. It provisions the backend and Render Postgres. Set FRONTEND_URLS to the Vercel URL.

## Vercel

Import this repository as a Next.js project and set:

    NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com

Redeploy after setting the variable.

## Production hardening

Add rate limiting, password reset/email verification, monitoring, backups, and end-to-end tests before a public launch.