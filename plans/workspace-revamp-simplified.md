# Workspace Revamp - Simplified Implementation Plan

## Executive Summary

This is a **simplified, phased approach** to revamping the workspace/organization functionality. The focus is on **core @dnd-kit migration first**, with advanced features added incrementally in later phases.

## Phase 1: Core @dnd-kit Migration (MVP)

### Objective

Replace `@hello-pangea/dnd` with `@dnd-kit` while maintaining existing functionality.

### Scope

- ✅ Install `@dnd-kit` packages
- ✅ Migrate drag & drop components to use `@dnd-kit`
- ✅ Maintain existing integer-based ordering (defer fractional indexing)
- ✅ Keep existing data structures (defer normalized cache)
- ✅ Preserve current UI/UX

### Tasks

#### 1.1 Install Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
npm uninstall @hello-pangea/dnd
```

#### 1.2 Create DnD Configuration

**File: `src/components/boards/dnd-config.ts`**

```typescript
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

export const dndConfig = {
  sensors: {
    pointer: {
      activationConstraint: {
        distance: 5,
      },
    },
  },
  collisionDetection: {
    cards: closestCorners,
    lists: rectIntersection,
  },
  sorting: {
    cards: verticalListSortingStrategy,
    lists: horizontalListSortingStrategy,
  },
}
```

#### 1.3 Migrate ListContainer Component

**File: `src/app/(platform)/(dashboard)/board/_components/list-container.tsx`**

```typescript
"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"

import { List, Card } from "@/lib/api-client"
import { ListForm } from "@/components/boards/forms/list-form"
import { ListItem } from "@/components/boards/list-item"

interface ListContainerProps {
  lists: List[]
  boardId: string
}

export const ListContainer = ({ lists, boardId }: ListContainerProps) => {
  const [orderedLists, setOrderedLists] = useState(lists)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active list and over list
    const activeList = orderedLists.find((list) => list.id === activeId)
    const overList = orderedLists.find((list) => list.id === overId)

    if (!activeList || !overList) return

    // If dragging a list
    if (activeList && overList && activeList !== overList) {
      const oldIndex = orderedLists.findIndex((list) => list.id === activeId)
      const newIndex = orderedLists.findIndex((list) => list.id === overId)

      const newLists = [...orderedLists]
      const [removed] = newLists.splice(oldIndex, 1)
      newLists.splice(newIndex, 0, removed)

      // Update positions
      newLists.forEach((list, index) => {
        list.position = index
      })

      setOrderedLists(newLists)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle list reordering
    const activeList = orderedLists.find((list) => list.id === activeId)
    const overList = orderedLists.find((list) => list.id === overId)

    if (activeList && overList) {
      const oldIndex = orderedLists.findIndex((list) => list.id === activeId)
      const newIndex = orderedLists.findIndex((list) => list.id === overId)

      if (oldIndex !== newIndex) {
        const newLists = [...orderedLists]
        const [removed] = newLists.splice(oldIndex, 1)
        newLists.splice(newIndex, 0, removed)

        // Update positions
        newLists.forEach((list, index) => {
          list.position = index
        })

        setOrderedLists(newLists)

        // Call API to update positions (when backend is ready)
        // updateListPosition(boardId, newLists)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={orderedLists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-x-3">
          {orderedLists.map((list) => (
            <ListItem key={list.id} list={list} />
          ))}
          <ListForm />
          <div className="w-1 flex-shrink-0"></div>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="w-[272px] rounded-md bg-muted shadow-md opacity-50">
            {/* Placeholder for dragged list */}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
```

#### 1.4 Migrate ListItem Component

**File: `src/components/boards/list-item.tsx`**

```typescript
"use client"

import { useRef, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { ListWithCards } from "@/prisma/types"
import { cn } from "@/lib/utils"

import { CardItem } from "./card-item"
import { CardForm } from "./forms/card-form"
import { ListHeader } from "./list-header"

interface ListItemProps {
  list: ListWithCards
}

export const ListItem = ({ list }: ListItemProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function disableEditing() {
    setIsEditing(false)
  }

  function enableEditing() {
    setIsEditing(true)
    setTimeout(() => {
      textAreaRef.current?.focus()
    })
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="h-full w-[272px] shrink-0 select-none"
    >
      <div className="w-full rounded-md bg-muted pb-2 shadow-md dark:bg-background">
        <div {...attributes} {...listeners}>
          <ListHeader list={list} onAddCard={enableEditing} />
        </div>
        <div className="mx-1 flex flex-col gap-y-2 px-1 py-0.5 mt-2">
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
        <CardForm
          ref={textAreaRef}
          isEditing={isEditing}
          enableEditing={enableEditing}
          disableEditing={disableEditing}
          listId={list.id}
        />
      </div>
    </li>
  )
}
```

#### 1.5 Migrate CardItem Component

**File: `src/components/boards/card-item.tsx`**

```typescript
"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@prisma/client"

import { useCardModal } from "@/hooks/use-card-modal"

interface CardItemProps {
  card: Card
}

export const CardItem = ({ card }: CardItemProps) => {
  const { onOpen } = useCardModal((state) => state)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      onClick={() => onOpen(card.id)}
      className="truncate rounded-md border-2 border-transparent bg-background px-3 py-2 text-sm shadow-sm hover:border-foreground dark:bg-muted"
    >
      <p>{card.title}</p>
      <span className="truncate text-xs text-muted-foreground">
        {card.description}
      </span>
    </div>
  )
}
```

#### 1.6 Update Board Page

**File: `src/app/(platform)/(dashboard)/board/[boardId]/page.tsx`**

```typescript
"use client"

import { useQuery } from "@tanstack/react-query"

import { mockLists } from "@/lib/mock-data"

import { ListContainer } from "../_components/list-container"

interface BoardIdPageProps {
  params: {
    boardId: string
  }
}

export default function BoardIdPage({ params }: BoardIdPageProps) {
  // Filter mock lists for this board
  const lists = mockLists.filter((list) => list.boardId === params.boardId)

  return (
    <div className="h-full overflow-x-auto p-4">
      <ListContainer boardId={params.boardId} lists={lists} />
    </div>
  )
}
```

### Success Criteria for Phase 1

- ✅ Drag and drop works for lists
- ✅ Drag and drop works for cards
- ✅ No breaking changes to existing functionality
- ✅ Maintains current integer-based ordering
- ✅ Performance is acceptable (baseline for optimization)

---

## Phase 2: Performance Optimization (60FPS)

### Objective

Optimize drag & drop performance to achieve 60FPS.

### Scope

- ✅ Optimize DragOverlay (minimal rendering)
- ✅ CSS transforms only during drag
- ✅ Disable pointer-events on siblings during drag
- ✅ Use will-change: transform
- ✅ No state writes during drag
- ✅ Memoization where appropriate

### Tasks

#### 2.1 Optimize DragOverlay

**Update: `src/components/boards/drag-overlay.tsx`**

```typescript
"use client"

import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface DragOverlayProps {
  id: string
  type: "list" | "card"
  title: string
}

export const DragOverlay = ({ id, type, title }: DragOverlayProps) => {
  const style = {
    transform: "none",
    transition: "none",
  }

  if (type === "list") {
    return (
      <div
        style={style}
        className="w-[272px] h-32 rounded-md bg-muted shadow-xl opacity-90 border-2 border-primary"
      >
        <div className="p-3 font-medium">{title}</div>
      </div>
    )
  }

  return (
    <div
      style={style}
      className="w-[252px] h-16 rounded-md bg-background shadow-xl opacity-90 border-2 border-primary"
    >
      <div className="px-3 py-2 text-sm">{title}</div>
    </div>
  )
}
```

#### 2.2 Add Performance Utilities

**File: `src/lib/performance.ts`**

```typescript
/**
 * Performance utilities for drag & drop operations
 */

export function disablePointerEventsOnSiblings(element: HTMLElement) {
  const siblings = Array.from(element.parentElement?.children || [])
  siblings.forEach((sibling) => {
    if (sibling !== element) {
      sibling.style.pointerEvents = "none"
    }
  })
}

export function enablePointerEventsOnSiblings(element: HTMLElement) {
  const siblings = Array.from(element.parentElement?.children || [])
  siblings.forEach((sibling) => {
    sibling.style.pointerEvents = ""
  })
}

export function addWillChangeTransform(element: HTMLElement) {
  element.style.willChange = "transform"
}

export function removeWillChangeTransform(element: HTMLElement) {
  element.style.willChange = ""
}
```

#### 2.3 Update ListContainer with Performance Optimizations

```typescript
// Add to onDragStart
const onDragStart = (event: DragStartEvent) => {
  setActiveId(event.active.id as string)
  // Performance: Disable pointer events on siblings
  const activeElement = document.querySelector(
    `[data-draggable-id="${event.active.id}"]`
  )
  if (activeElement) {
    disablePointerEventsOnSiblings(activeElement as HTMLElement)
    addWillChangeTransform(activeElement as HTMLElement)
  }
}

// Add to onDragEnd
const onDragEnd = (event: DragEndEvent) => {
  setActiveId(null)
  // Performance: Re-enable pointer events
  const activeElement = document.querySelector(
    `[data-draggable-id="${event.active.id}"]`
  )
  if (activeElement) {
    enablePointerEventsOnSiblings(activeElement as HTMLElement)
    removeWillChangeTransform(activeElement as HTMLElement)
  }
  // ... rest of onDragEnd logic
}
```

### Success Criteria for Phase 2

- ✅ 60FPS during drag operations
- ✅ No layout thrashing
- ✅ Minimal re-renders
- ✅ Smooth visual feedback

---

## Phase 3: Fractional Indexing (Future)

### Objective

Replace integer-based ordering with fractional indexing for infinite reordering.

### Scope

- ✅ Implement fractional indexing utility
- ✅ Migrate data structure to use fractional indices
- ✅ Update API to handle fractional indices
- ✅ Update UI to display fractional indices correctly

### Tasks

- Create `src/lib/fractional-indexing.ts`
- Update type definitions
- Migrate existing data
- Update API calls

### Success Criteria for Phase 3

- ✅ Infinite reordering without recalculating entire lists
- ✅ Conflict-resistant for real-time scenarios
- ✅ Backward compatible with existing data

---

## Phase 4: Normalized Cache (Future)

### Objective

Implement normalized cache layer for O(1) updates.

### Scope

- ✅ Create normalized cache structure
- ✅ Implement cache operations
- ✅ Update components to use cache
- ✅ Add optimistic updates with rollback

### Tasks

- Create `src/store/normalized-cache.ts`
- Create cache hooks
- Update components to use cache
- Implement optimistic updates

### Success Criteria for Phase 4

- ✅ O(1) updates for entities
- ✅ Minimal re-renders
- ✅ Optimistic updates with rollback

---

## Phase 5: Real-Time Ready (Future)

### Objective

Design architecture for real-time updates.

### Scope

- ✅ Event-driven cache updates
- ✅ WebSocket event handlers
- ✅ Partial update support

### Tasks

- Create real-time event types
- Implement WebSocket hooks
- Add event handlers

### Success Criteria for Phase 5

- ✅ Ready for WebSocket integration
- ✅ Event-driven cache updates
- ✅ Partial update support

---

## Phase 6: Advanced Features (Future)

### AI-Ready Metadata

- Card metadata structure
- Embedding support
- Auto-tags

### Activity Timeline

- Track card activities
- Audit trail
- Display in UI

### Priority System

- Visual indicators
- Filtering support
- Bulk edit

### Smart Labels

- Color support
- Description support
- Search indexing

### Virtualization

- Windowing for large lists
- Maintain drag compatibility
- Render only visible cards

### Permission System

- Board-level permissions
- List-level restrictions
- Card-level visibility

---

## Migration Strategy

### Step 1: Feature Flag

Create a feature flag to switch between old and new implementation:

```typescript
// src/config/features.ts
export const features = {
  useDndKit: process.env.NEXT_PUBLIC_USE_DND_KIT === "true",
}
```

### Step 2: Parallel Implementation

- Keep existing `@hello-pangea/dnd` implementation
- Implement new `@dnd-kit` components alongside
- Use feature flag to switch between implementations

### Step 3: Gradual Rollout

- Enable for test boards first
- Monitor performance metrics
- Collect user feedback

### Step 4: Full Migration

- Remove old implementation
- Clean up unused code
- Update documentation

---

## Testing Strategy

### Phase 1 Testing

- Manual testing of drag & drop
- Verify existing functionality works
- Check for regressions

### Phase 2 Testing

- Performance profiling
- FPS measurement during drag
- Identify bottlenecks

### Future Phases

- Unit tests for fractional indexing
- Integration tests for cache operations
- E2E tests for complete flows

---

## Success Criteria

### Overall

- ✅ Drag & drop works with `@dnd-kit`
- ✅ Maintains existing functionality
- ✅ Performance is acceptable (60FPS)
- ✅ No breaking changes
- ✅ Ready for future enhancements

### Phase 1 (MVP)

- ✅ @dnd-kit migration complete
- ✅ Drag & drop functional
- ✅ Integer ordering maintained

### Phase 2 (Performance)

- ✅ 60FPS during drag
- ✅ Optimized DragOverlay
- ✅ No layout thrashing

### Future Phases

- ✅ Fractional indexing
- ✅ Normalized cache
- ✅ Real-time ready
- ✅ Advanced features

---

## Next Steps

1. **Review this simplified plan**
2. **Approve Phase 1 implementation**
3. **Set up development environment**
4. **Begin Phase 1: Core @dnd-kit Migration**
5. **Test and validate**
6. **Proceed to Phase 2: Performance Optimization**

---

**Note**: This simplified approach allows for incremental progress, reduces risk, and provides a clear path forward. Each phase builds on the previous one, with the option to pause or adjust direction based on feedback and results.
