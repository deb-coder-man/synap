# Kanban Board Drag-and-Drop Bug Fix Plan

## Root Cause Analysis

The previous session's fix introduced TWO new bugs by adding `queryClient.setQueryData` inside `onDragOver` for list reordering. This caused React re-renders mid-drag that interfere with dnd-kit's own transform system.

### Bug 1 — Can't Drag Left (No Scroll)

When you grab a list and move left over another list, `onDragOver` fires → updates the query cache → React re-renders → `lists` array changes order → `SortableContext` gets new `items` → dnd-kit recalculates transforms and "teleports" the active item to its new cache position → this absorbs the leftward movement, making it impossible to continue dragging left.

### Bug 2 — Pickup Offset When Scrolled

Same root cause: cache updates during drag cause re-renders that confuse dnd-kit's initial rect measurement relative to scroll position.

---

## Fix Plan

### File: `src/app/(dashboard)/board/page.tsx`

---

### Change 1 — Remove `onDragOver` List Preview Block

Delete the `if (activeData?.type === "list" && ...)` block that calls `queryClient.setQueryData`.

dnd-kit's `horizontalListSortingStrategy` handles the visual preview natively via CSS transforms — no React re-renders needed during drag.

---

### Change 2 — Restore `onDragEnd` List Logic

The previous session changed `onDragEnd` to assume the cache was already correct (from `onDragOver` updates). With `onDragOver` updates removed, revert to proper `arrayMove` logic:

```ts
const oldIndex = lists.findIndex((l) => l.id === active.id);
const newIndex = lists.findIndex((l) => l.id === over.id);
const reordered = arrayMove(lists, oldIndex, newIndex);
queryClient.setQueryData(listKeys.all, reordered.map((l, i) => ({ ...l, order: i })));
reorderLists(reordered.map((list, i) => ({ id: list.id, order: i })));
```

---

### Change 3 — Scroll Offset Modifier

- Add `scrollContainerRef` (`RefObject<HTMLDivElement>`) and `dragStartScrollLeft` (`MutableRefObject<number>`)
- In `onDragStart`, capture `dragStartScrollLeft.current = scrollContainerRef.current?.scrollLeft ?? 0`
- Add `scrollOffsetModifier` that subtracts scroll delta: `x: transform.x - (currentScrollLeft - dragStartScrollLeft)`
- Attach `ref={scrollContainerRef}` to the scroll container div
- Add `modifiers={[scrollOffsetModifier]}` to `DragOverlay`

---

### Change 4 — Disable CSS Snap During Drag

Conditionally remove `snap-x snap-mandatory scroll-smooth` from the scroll container when `activeList !== null`.

---

### Change 5 — Enhanced DragOverlay

Show up to 3 task card previews inside the overlay instead of just the count.

---

## Key Principle

dnd-kit manages its own visual state during a drag via CSS transforms applied to sortable items. Updating React state (or the query cache) mid-drag forces a re-render that resets those transforms, causing the "teleport" effect. The correct pattern is:

- **During drag (`onDragOver`)**: Do NOT update any state that controls `SortableContext` items or list order.
- **After drag (`onDragEnd`)**: Compute the final order using `arrayMove`, then update cache and fire the API mutation.
