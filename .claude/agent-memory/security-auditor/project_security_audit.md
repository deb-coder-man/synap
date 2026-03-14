---
name: Synap Security Audit — March 2026
description: Complete vulnerability list, severity ratings, file locations, and remediation priorities from the first full security audit of Synap
type: project
---

## Audit date
2026-03-15

## Summary counts
- CRITICAL: 2
- HIGH: 5
- MEDIUM: 5
- LOW/INFO: 5

## CRITICAL findings
1. Dead middleware — `src/proxy.ts` is never executed by Next.js (wrong filename). All unauthenticated redirect protection for non-dashboard pages relies solely on the dashboard layout check. Auth pages have no redirect for logged-in users.
2. `/api/tasks/reorder` BOLA — accepts arbitrary `listId` per task item without verifying the target list belongs to the authenticated user. Authenticated users can move tasks into other users' lists.

## HIGH findings
1. Zero rate limiting on login, register, magic-link, and all API write endpoints — brute force and credential stuffing attacks unimpeded.
2. `/api/prioritisation` prompt injection — task `title` values from client body interpolated directly into Anthropic LLM prompt without sanitization.
3. No security HTTP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) — reflected XSS if introduced, clickjacking possible.
4. No CSRF protection on API routes — cross-origin state-changing requests possible if cookie SameSite is not enforced.
5. Dependency vulnerabilities — 4 HIGH CVEs including auth bypass and XSS in hono/prisma-dev transitive deps.

## MEDIUM findings
1. Unvalidated `image` URL stored in DB and rendered in `<img src>` without scheme/domain check — SSRF risk if server-side fetched, open redirect via javascript: URIs.
2. No input length validation on any API field (title, description, name, colour, fontFamily, username) — DB overflow and resource exhaustion.
3. Password complexity enforced only via HTML `minLength` attribute — bypassable by API calls or disabling HTML validation.
4. `/api/prioritisation` uses client-supplied task array (not re-queried from DB) — task data sent to Anthropic is not authoritative.
5. CSS custom property injection via `backgroundColor`/`textColor` settings — values stored in DB written to `document.documentElement.style.setProperty` without validation.

## LOW/INFO findings
1. JWT session has no explicit `maxAge` configured — uses NextAuth default; no server-side revocation.
2. `image` field rendered via `<img>` not Next.js `<Image>` — no domain restriction, allows hotlinking.
3. Prisma in development mode logs all queries — ensure `NODE_ENV=production` in prod deployment.
4. `src/proxy.ts` should be renamed to `src/middleware.ts` for clarity and to actually activate.
5. No CAPTCHA or bot detection on registration or magic-link send.

## Priority remediation order
1. Rename `src/proxy.ts` → `src/middleware.ts` (activates all route protection)
2. Add rate limiting to `/api/auth`, login, register, magic-link endpoints
3. Fix `/api/tasks/reorder` to verify new `listId` belongs to the authenticated user
4. Add security headers in `next.config.ts`
5. Add server-side input validation (length limits, URL scheme checks) on all API routes
6. Add server-side password length check in registration Server Action
7. Validate `image` URL scheme (allow only https://)
8. Set explicit JWT `maxAge` in NextAuth config
9. Add CSRF origin check or SameSite=Strict on session cookie
10. Upgrade Prisma to resolve transitive hono/lodash CVEs
