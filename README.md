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

The API runs on http://localhost:4000.

Frontend:

    copy .env.example .env.local
    npm install
    npm run dev

Open http://localhost:3000.

The Next.js app proxies /api/backend/* to BACKEND_URL, so the browser talks to its own frontend origin while the data and auth service remains on Render.

## Render

The repository contains render.yaml. Create a Render Blueprint from the repo. It provisions the backend and Render Postgres. Set FRONTEND_URLS to your Vercel production URL.

Verify:

    https://YOUR-API.onrender.com/health

## Vercel

Import this repository as a Next.js project and set:

    BACKEND_URL=https://YOUR-API.onrender.com

Deploy the frontend. The rewrite in next.config.mjs proxies /api/backend/* to Render.

## Features

- Email/password accounts.
- Per-user novel isolation.
- Novel and chapter CRUD.
- Debounced autosave.
- Repeated word highlighting after 3 occurrences, ignoring common stopwords.
- Click a repeated word for Datamuse synonyms.
- Replace one or every occurrence.
- Voice input in English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Urdu, Spanish, French, German and Japanese.
- Optional translation into English.
- Gothic SVG background.
- Responsive desktop/mobile editor.

## Production hardening

Add rate limiting, password reset/email verification, database backups, monitoring, audit logging, and end-to-end browser tests before a public launch.