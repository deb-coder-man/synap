# Synap UX Fixes — Implementation Checklist

**Project**: Synap task manager
**Stack**: Next.js 16, TypeScript, Tailwind v4, TanStack Query, Zustand, dnd-kit
**Scope**: 6 targeted UX bug fixes. No new features, no scope expansion.
**Status legend**: `[ ]` = pending, `[x]` = done

---

## Fix 1 — Drag-and-drop list reordering bug

**File**: `src/app/(dashboard)/board/page.tsx`

**Root cause summary**: `closestCorners` picks wrong drop targets on a scrolled horizontal
board. `onDragOver` also skips list-drag live preview entirely — it returns early whenever
`activeData.type !== "task"` (line 73), so dragging a list column produces no ghost
repositioning during the drag.

- [ ] **1a. Replace collision detection algorithm**
  - File: `src/app/(dashboard)/board/page.tsx`
  - Line 12: change import `closestCorners` → `closestCenter` (same `@dnd-kit/core` import block)
  - Line 193: change `collisionDetection={closestCorners}` → `collisionDetection={closestCenter}`
  - Acceptance: dragging a task card to any column on a scrolled board snaps to the correct
    target column, not the one diagonally adjacent

- [ ] **1b. Add live-preview reordering for list drags inside `onDragOver`**
  - File: `src/app/(dashboard)/board/page.tsx`, `onDragOver` function (lines 66-112)
  - The existing early-return `if (activeData?.type !== "task") return;` must become a
    conditional branch so list drags fall through to their own block
  - When `activeData?.type === "list"` and `overData?.type === "list"` and `active.id !== over.id`:
    - Compute `oldIndex = lists.findIndex((l) => l.id === active.id)`
    - Compute `newIndex = lists.findIndex((l) => l.id === over.id)`
    - Call `queryClient.setQueryData(listKeys.all, arrayMove(lists, oldIndex, newIndex))`
  - Acceptance: dragging a list column shows it sliding into its new position in real time,
    not only snapping on drop

---

## Fix 2 — Instant feedback for card archival

**File**: `src/app/components/board/ListColumn.tsx`

**Root cause summary**: Lines 29-30 filter tasks for display but never check `archived`.
When the archive mutation runs its optimistic update (`archived: true`), the card stays
visible because the filter only tests `completed`.

- [ ] **2a. Exclude archived tasks from the active task list**
  - File: `src/app/components/board/ListColumn.tsx`, line 29
  - Change:
    ```ts
    const activeTasks = list.tasks.filter((t) => !t.completed);
    ```
    to:
    ```ts
    const activeTasks = list.tasks.filter((t) => !t.completed && !t.archived);
    ```
  - Acceptance: archiving a task makes it disappear from the active section immediately
    without a page reload

- [ ] **2b. Exclude archived tasks from the completed task list**
  - File: `src/app/components/board/ListColumn.tsx`, line 30
  - Change:
    ```ts
    const completedTasks = list.tasks.filter((t) => t.completed);
    ```
    to:
    ```ts
    const completedTasks = list.tasks.filter((t) => t.completed && !t.archived);
    ```
  - Acceptance: a task that is both completed and archived does not appear in either
    the active or the completed section

---

## Fix 3 — Archival cron scheduler not running

**Files**: `src/proxy.ts`, `src/app/api/cron/archive-completed/route.ts`

**Root cause summary**:
- (a) `src/proxy.ts` exports the auth middleware but Next.js only auto-loads
  `src/middleware.ts`. The file has the correct logic and `config` matcher but the wrong
  name, so it is never executed — auth protection is silently absent and the cron scheduler
  relies on this middleware being active.
- (b) The cron route has no `export const runtime` declaration. Because `lib/prisma.ts`
  imports the `ws` package, the route can silently fail or be skipped in the Edge runtime
  that Vercel defaults to.

- [ ] **3a. Rename (or re-export) auth middleware so Next.js picks it up**
  - Option A (preferred — rename in place): rename `src/proxy.ts` → `src/middleware.ts`
  - Option B (if renaming breaks other imports): create `src/middleware.ts` containing
    `export { default, config } from "./proxy"` and leave `proxy.ts` unchanged
  - Acceptance: unauthenticated requests to `/board` are redirected to `/login`; authenticated
    users visiting `/login` are redirected to `/board`

- [ ] **3b. Pin the cron route to the Node.js runtime**
  - File: `src/app/api/cron/archive-completed/route.ts`
  - Add at the top of the file (before the `GET` export):
    ```ts
    export const runtime    = 'nodejs';
    export const maxDuration = 60;
    ```
  - Acceptance: the route executes successfully on Vercel without a runtime error; Prisma
    and the `ws` package initialise without complaint

---

## Fix 4 — Instant feedback for task creation

**File**: `src/app/components/board/InlineTaskCreator.tsx`

**Root cause summary**: `toast.success("Task created")` and `onCancel()` are inside the
`onSuccess` callback (lines 58-61), so they are delayed until the API round-trip completes.
The TanStack Query optimistic update already inserts the task card immediately, so the UI
is inconsistent — the card appears but the form stays open and no toast fires until the
server responds.

- [ ] **4a. Fire toast and dismiss form immediately on submit**
  - File: `src/app/components/board/InlineTaskCreator.tsx`, `handleSubmit` function
    (lines 46-64)
  - Move `toast.success("Task created")` and `onCancel()` to run immediately after the
    `createTask(...)` call, at the end of `handleSubmit` — not inside `onSuccess`
  - Remove the `onSuccess` callback object from the `createTask` call entirely (the
    second argument to `mutate` can be dropped; keep the mutation call itself)
  - Acceptance: the inline form closes and the success toast appears the moment the user
    presses Add or Enter, while the task card is already visible via the optimistic update

---

## Fix 5 — Font selection not working in ThemePanel

**File**: `src/app/stores/themeStore.ts`

**Root cause summary**: `applyThemeToDOM` sets `--font-active` on `:root` (line 83), but
every component in the codebase uses `font-[family-name:var(--font-delius)]` or
`font-[family-name:var(--font-sans)]`. Nothing reads `--font-active`, so selecting a font
in ThemePanel has no visible effect.

- [ ] **5a. Replace `--font-active` logic with direct overrides of `--font-delius` and `--font-sans`**
  - File: `src/app/stores/themeStore.ts`, `applyThemeToDOM` function (lines 70-85)
  - Remove the `fontMap` declaration and the `root.style.setProperty("--font-active", ...)` line
  - Replace them with a `fontValues` map that holds concrete CSS font-family strings (not
    `var()` references), and set both `--font-delius` and `--font-sans` on `document.documentElement`:
    ```ts
    const fontValues: Record<string, string> = {
      Delius:    "'Delius', cursive",
      Inter:     "'Inter', sans-serif",
      Georgia:   "Georgia, 'Times New Roman', serif",
      monospace: "'Courier New', Courier, monospace",
    };
    root.style.setProperty("--font-delius", fontValues[font] ?? fontValues["Inter"]);
    root.style.setProperty("--font-sans",   fontValues[font] ?? fontValues["Inter"]);
    document.body.style.fontFamily = fontValues[font] ?? fontValues["Inter"];
    ```
  - Keep the existing `--background` and `--foreground` setProperty lines untouched
  - Acceptance: selecting "Georgia" in ThemePanel immediately changes the visible typeface
    across all board columns, task cards, and navigation elements; re-selecting "Delius"
    restores the original handwritten style; the change persists across page reloads
    (Zustand persist middleware already stores `font` in localStorage)

---

## Fix 6 — Footer not sticking to bottom

**File**: `src/app/components/Footer.tsx`

**Root cause summary**: The footer className on line 14 includes `bottom-0 left-0 right-0 z-40`
but has no positioning class (`fixed`, `absolute`, or `sticky`). Without one, those
directional utilities are inert and the footer renders in normal document flow.

- [ ] **6a. Add `fixed` positioning class to the footer element**
  - File: `src/app/components/Footer.tsx`, line 14
  - In the `<footer>` className template literal, add `fixed` before `bottom-0`:
    - Before: `` className={` bottom-0 left-0 right-0 z-40 flex items-center ...` ``
    - After:  `` className={`fixed bottom-0 left-0 right-0 z-40 flex items-center ...` ``
  - Note: the layout already adds `pb-[76px] sm:pb-[52px]` to the main content area, so
    no additional padding changes are needed to prevent content from being obscured
  - Acceptance: the footer stays pinned to the viewport bottom when scrolling through a
    long task list; it does not overlap any task content because of the existing layout padding

---

## Completion Gate

All 6 fixes are shippable together as one PR. Before marking the PR ready:

- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No ESLint errors (`next lint` passes)
- [ ] Manual smoke test: drag a list column, verify live preview and correct drop position
- [ ] Manual smoke test: archive a card, verify it disappears instantly
- [ ] Manual smoke test: create a task via inline form, verify form closes immediately
- [ ] Manual smoke test: change font in ThemePanel, verify it applies site-wide
- [ ] Manual smoke test: scroll page on mobile, verify footer stays at viewport bottom
- [ ] Verify `/board` redirects unauthenticated requests to `/login` (middleware rename)
- [ ] Verify cron route responds 200 when called locally with correct `Authorization` header
