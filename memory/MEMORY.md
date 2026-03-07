# Pili-Pinas App — Claude Memory

## User Preferences
- **Always use TDD**: Write tests before implementation. Use Jest + React Testing Library.

## Project
- **Repo**: `github.com/Pili-pinas/pili-pinas-app`
- **Stack**: Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS 4
- **Design**: Graffiti/street art theme, black bg, Permanent Marker font

## Architecture
- `src/app/page.tsx` — Home page with "Tanong Mo!" + "Contact Us" CTA buttons
- `src/app/chat/page.tsx` — Client component; auth gate (login form → chat)
- `src/app/contact/page.tsx` — Contact page with Facebook link
- `src/app/api/query/route.ts` — Proxies queries to fly.io backend using user's API key
- `src/components/Chat.tsx` — Chat UI, accepts `apiKey` + `onUnauthorized` props
- `src/lib/types.ts` — Shared types (Message, QueryResponse, Source)

## APIs
- **Auth (login)**: `POST https://rag-pipeline-91ct.vercel.app/api/users/login` → `{ api_key }`
- **Query**: `https://pili-pinas-api.fly.dev/query` (via Next.js API route `/api/query`)
- **Auth header**: `X-API-Key: <apiKey>`
- **localStorage key**: `"apiKey"`
- **Auto-logout**: on 401/403 from query API

## Environment
- `.env.local`: `PILI_PINAS_API_URL=https://pili-pinas-api.fly.dev`
- `PILI_PINAS_API_KEY` env var no longer used (replaced by per-user keys)
