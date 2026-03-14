---
name: Synap Auth Architecture
description: How authentication is enforced across routes, middleware topology, and session handling in Synap
type: project
---

## Auth enforcement layers

**NextAuth v5 beta (JWT strategy)** — configured in `src/auth.ts`.

### Middleware
`src/proxy.ts` contains the intended middleware (exports `default auth(...)` and `config.matcher`), but it is located at the WRONG PATH. Next.js only recognises `src/middleware.ts` or `./middleware.ts` (project root). Therefore the middleware in `proxy.ts` is NEVER executed. Route protection depends entirely on per-route checks.

### Page-level protection
- Dashboard pages: `src/app/(dashboard)/layout.tsx` calls `auth()` and redirects to `/login` if no session. Reliable gate for all dashboard UI routes.
- Auth pages (`/login`, `/register`): No server-side redirect for already-authenticated users (the proxy.ts redirect is dead code). Minor UX issue but not a security hole.

### API-level protection
All API routes call `requireAuth()` from `src/lib/api-auth.ts` at the start of every handler. As of the March 2026 audit, all 9 API route files properly call `requireAuth()`.

**Exception**: `/api/prioritisation/route.ts` calls `requireAuth()` correctly, but also makes outbound calls to Anthropic with user-controlled task data (no server-side ownership re-verification — relies on client-supplied task array).

### Session strategy
JWT — no database session table used at runtime. Token contains `id` (userId). Tokens have no explicit `maxAge` set in `src/auth.ts`, so they default to NextAuth's default session expiry.

**Why this matters:** No explicit JWT expiry configured → if a token is stolen, there is no server-side revocation mechanism.

### Password hashing
bcryptjs with work factor 12 — strong. Used correctly in registration Server Action.

### OAuth providers
Google and GitHub. No `state` parameter bypass risk — NextAuth handles this internally.

### Magic link (Resend provider)
Token expiry is managed by NextAuth/Resend. No custom expiry override observed — relies on provider defaults.
