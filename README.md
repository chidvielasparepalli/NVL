# NOVAL — Novel Writer

A private, gothic, distraction-free novel writing room built with Next.js App Router, TypeScript, Tailwind CSS, NextAuth Google OAuth, Prisma + SQLite, Tiptap, Datamuse, and the browser Web Speech API.

## Features

- Google OAuth only.
- Every signed-in user sees only their own novels.
- Create, rename, delete and edit novels.
- Multiple chapters per novel.
- Debounced chapter autosave to SQLite.
- Tiptap rich-text editor with a clean writing mode.
- Repeated-word detection at 3+ occurrences per chapter, ignoring common stopwords.
- Click a highlighted word to fetch Datamuse synonyms. Nearby sentence context is also sent for ranking.
- Replace one occurrence or every occurrence.
- Voice writing with English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Urdu, Spanish, French, German and Japanese.
- Optional free translation to English after dictation through MyMemory.
- Dark gothic SVG tile background with faint skull, heart, warning, cross, and lightning icons.
- Mobile-responsive chapter navigation and editor.
- GitHub Actions verification for TypeScript and production builds.

## Local setup

PowerShell:

    git clone https://github.com/chidvielasparepalli/NVL.git D:NOVAL
    cd D:NOVAL
    copy .env.example .env.local
    npm install
    npx prisma db push
    npm run dev

Open http://localhost:3000.

## Google OAuth — exact setup

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Create a new project, or select an existing project.
3. In the top project picker, choose the project.
4. Open **APIs & Services → OAuth consent screen**.
5. Choose **External** unless this is an organization-only app.
6. Enter an app name such as **NOVAL**.
7. Add a support email and developer contact email.
8. Save and continue through the consent-screen steps. For local development, you can keep scopes to the defaults needed for sign-in.
9. Open **APIs & Services → Credentials**.
10. Click **Create Credentials → OAuth client ID**.
11. Choose **Web application**.
12. Give it a name such as **NOVAL Local**.
13. Under **Authorized JavaScript origins**, add:
    http://localhost:3000
14. Under **Authorized redirect URIs**, add exactly:
    http://localhost:3000/api/auth/callback/google
15. Click **Create**.
16. Copy the **Client ID** and **Client secret**.
17. Put them in D:NOVAL.env.local:

    GOOGLE_CLIENT_ID="paste-your-client-id"
    GOOGLE_CLIENT_SECRET="paste-your-client-secret"

18. Generate a local secret and set it in .env.local. A simple PowerShell command is:

    [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

19. Set:

    NEXTAUTH_SECRET="your-generated-secret"

20. Keep:

    DATABASE_URL="file:./dev.db"
    NEXTAUTH_URL="http://localhost:3000"

Never commit .env.local.

## Database

This project intentionally uses SQLite for a fully local, no-paid-service setup.

    npx prisma db push

The SQLite database is created at prisma/dev.db and is ignored by Git.

## Useful commands

    npm run dev
    npm run typecheck
    npm run build
    npx prisma studio

## Notes

- Browser voice input depends on Web Speech API support and microphone permissions.
- Speech recognition quality varies by browser and selected language.
- Datamuse and MyMemory are external free services and can rate-limit or fail temporarily.
- Google OAuth credentials are intentionally not committed.
- For production deployment, move SQLite to a persistent managed database or another server-side database provider.
