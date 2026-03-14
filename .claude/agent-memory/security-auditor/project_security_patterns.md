---
name: Synap Security Patterns and Gaps
description: Recurring security strengths, weaknesses, and control gaps found across Synap's API routes and frontend as of March 2026
type: project
---

## Consistent strengths
- All API routes call `requireAuth()` before any data operation.
- BOLA/IDOR: Prisma queries scope every data operation to `{ userId }` — users cannot read or modify other users' data through the standard CRUD endpoints.
- Password hashing: bcryptjs cost factor 12. No plaintext passwords anywhere.
- Error responses: generic messages returned to client; stack traces not exposed via HTTP.
- Prisma ORM used throughout — no raw SQL queries, so SQL injection risk is negligible.
- Sensitive fields excluded from `select` in `/api/user` — `password` hash never returned.

## Systemic gaps (from March 2026 audit)
- **Zero rate limiting** on any endpoint: login, register, magic-link send, API writes. Entire app is unprotected against brute force and abuse.
- **No input length validation** on any API route — titles, descriptions, colour values, usernames, image URLs all accepted at arbitrary length. Risk of DB field overflow and resource exhaustion.
- **No security HTTP headers**: no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy anywhere in `next.config.ts` or middleware.
- **No CSRF protection** on API routes. NextAuth session cookie has no explicit `SameSite` flag set.
- **proxy.ts is dead code** — middleware file is in wrong location (`src/proxy.ts` instead of `src/middleware.ts`). All unauthenticated redirect logic there does nothing.

## Specific one-off issues
- `/api/tasks/reorder` accepts a `listId` field per task item but does NOT verify the new `listId` belongs to the user. An authenticated user could move their task into another user's list.
- `/api/prioritisation` accepts a full task array from the client body (not re-queried from DB). User-controlled task `title` fields are interpolated into the Anthropic LLM prompt — prompt injection risk.
- `PATCH /api/user` accepts any string as `image` URL — stored and rendered in an `<img>` tag without validation. No URL scheme or domain restriction.
- `PATCH /api/settings` stores `backgroundColor`, `textColor`, `fontFamily` without validation. Values are written to `document.documentElement.style` via `applyThemeToDOM`. CSS `setProperty` is safe for colour fields but custom font strings bypass the fontMap if stored directly (fontMap lookup mitigates this partially).
- Password minimum length (8 chars) enforced only via HTML `minLength` attribute — no server-side check in the Server Action.
- `image` field in user profile rendered via `<img src={imageUrl}>` (not Next.js `<Image>`) — no domain restriction, allows hotlinking arbitrary URLs.

## Dependency vulnerabilities (npm audit, March 2026)
- 4 HIGH, 5 MODERATE total.
- Most critical: `@hono/node-server` (CVE — auth bypass via encoded slashes in static path middleware, pulled in by `@prisma/dev`).
- `hono` package has 9 separate HIGH CVEs including XSS via ErrorBoundary, prototype pollution, cookie injection, SSRF via serveStatic.
- `lodash` MODERATE — prototype pollution in `_.unset`/`_.omit`.
- Fix: upgrade `prisma` package to v6.19.2+ (semver major bump required).
