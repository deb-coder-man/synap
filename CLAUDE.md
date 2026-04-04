# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint

npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate                    # Regenerate the Prisma client
npx prisma studio                      # Open DB browser UI
```

There are no automated tests in this project.

## Architecture

**Synap** is a smart todo/task management app. Next.js 16 App Router, TypeScript, Tailwind CSS v4, Prisma 7 on Neon PostgreSQL.

### Route groups

- `src/app/(auth)/` — login & register pages (unauthenticated)
- `src/app/(dashboard)/` — board, matrix, action planner, archive, settings (requires session)
- `src/app/(public)/` — terms, privacy, support, request-change
- `src/app/api/` — REST API routes consumed by the frontend

### Data layer

- **Prisma client** is generated to `src/generated/prisma/` (not the default `node_modules`). Import from `@/lib/prisma` for the singleton client.
- **Client-side types** live in `src/lib/types.ts` and mirror the Prisma schema. Use these everywhere in the frontend; do not import from the generated Prisma client in client components.
- The `Task` model has both a `completed` flag and an `archived` flag. Archival happens automatically via a Vercel cron (`vercel.json` — daily at 03:00 UTC) that hits `GET /api/cron/archive-completed`, or manually by the user.

### State management

Two layers:
1. **TanStack Query** — server state. The canonical cache key for lists-with-tasks is `["lists"]`. All task mutations (create, update, delete) optimistically update this key and invalidate it on settle.
2. **Zustand stores** in `src/app/stores/` — UI-only state:
   - `taskStore` — selected task, create-task modal state
   - `listStore` — similar for lists
   - `themeStore` — persisted (localStorage key `synap-theme`); applies CSS custom properties `--background`, `--foreground`, `--font-active` to `:root`
   - `settingsStore` — pomodoro/app settings
   - `actionStore` — action planner session state

### API route pattern

Every authenticated API route starts with:
```ts
const auth = await requireAuth(); // from @/lib/api-auth
if (auth instanceof NextResponse) return auth;
const { userId } = auth;
```

All ownership checks use `userId` from the session, not from the request body.

### Authentication

NextAuth v5 (`src/auth.ts`) with four providers: Google, GitHub, Resend (magic link email), and Credentials (email/password with bcrypt). The Prisma adapter handles session persistence. `src/middleware.ts` protects dashboard routes.

### AI feature

`POST /api/prioritisation` calls the Anthropic API (`claude-haiku-4-5-20251001`) to order tasks within a time budget. The scoring logic (priority weight + urgency weight) is computed server-side and passed to the model — the model ranks, it does not score.

### Theming

The theme system works via CSS custom properties. `applyThemeToDOM` in `src/app/stores/themeStore.ts` sets `--background`, `--foreground`, and `--font-active` on `document.documentElement`. Tailwind's `bg-background` / `text-foreground` utility classes pick these up. Theme is persisted to localStorage; it is re-applied on mount in the dashboard layout.

### shadcn/ui components

Base UI components are in `src/components/ui/`. Add new ones with `npx shadcn add <component>`. Feature-specific components live under `src/app/components/<feature>/`.
