# Frontend-Only Cleanup Plan

## Executive Summary

Convert the Taskify Trello-clone from a full-stack application (Next.js with server actions, MongoDB, JWT auth) to a **frontend-only** application. The backend will be built separately by another developer using the same tech stack.

---

## Current State Analysis

### Backend Dependencies to Remove

| Dependency            | Purpose                           | Action                   |
| --------------------- | --------------------------------- | ------------------------ |
| `mongoose`            | MongoDB ODM                       | Remove from package.json |
| `jsonwebtoken`        | JWT token handling                | Remove from package.json |
| `@types/mongoose`     | TypeScript types for mongoose     | Remove from package.json |
| `@types/jsonwebtoken` | TypeScript types for jsonwebtoken | Remove from package.json |

### Frontend Dependencies to Keep

| Dependency                         | Purpose          | Action                                                                     |
| ---------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| `@hello-pangea/dnd`                | Drag and drop    | Keep (note: AGENTS.md specifies @dnd-kit, but this is already implemented) |
| `@tanstack/react-query`            | Data fetching    | Keep (will use for API calls)                                              |
| `zustand`                          | State management | Keep                                                                       |
| `unsplash-js`                      | Image API        | Keep                                                                       |
| All UI dependencies (@radix-ui/\*) | UI components    | Keep                                                                       |
| Next.js                            | Framework        | Keep                                                                       |

---

## Files and Directories to Delete

### 1. Backend Server Actions

```
src/actions/
├── copy-card/
├── copy-list/
├── create-board/
├── create-card/
├── create-list/
├── delete-board/
├── delete-card/
├── delete-list/
├── get-board/
├── update-board/
├── update-card/
├── update-card-position/
├── update-list/
└── update-list-position/
```

**Reason**: These are server actions that will be replaced by API calls to the separate backend.

### 2. Database Models

```
src/models/
├── AuditLog.ts
├── Board.ts
├── Card.ts
├── index.ts
├── List.ts
├── OrgLimit.ts
├── Organization.ts
└── User.ts
```

**Reason**: Mongoose models are not needed in a frontend-only app.

### 3. Backend Libraries

```
src/lib/
├── create-audit-log.ts  # Server-side audit logging
├── jwt.ts                # JWT token generation/verification
├── mongodb.ts            # MongoDB connection
├── org-limit.ts          # Server-side org limit checks
├── password.ts           # Server-side password hashing
├── rbac.ts               # Server-side permission checks
└── server-auth.ts        # Server-side auth utilities
```

**Keep**:

- `src/lib/create-safe-action.ts` - May be useful for form validation
- `src/lib/fetcher.ts` - HTTP client for API calls
- `src/lib/generate-log-message.ts` - Utility for generating log messages
- `src/lib/unsplash.ts` - Unsplash API client
- `src/lib/utils.ts` - General utilities

### 4. API Routes

```
src/app/api/
├── cards/
│   └── [cardId]/
│       ├── route.ts
│       └── logs/
│           └── route.ts
```

**Reason**: API routes will be in the separate backend service.

### 5. Middleware

```
src/middleware.ts
```

**Reason**: Authentication middleware is not needed in a frontend-only app. Will replace with a simple middleware that allows all routes.

### 6. Authentication Routes (Clerk and JWT)

```
src/app/(platform)/(clerk)/
src/app/(platform)/select-org/
src/app/(platform)/sign-in/
src/app/(platform)/sign-up/
```

**Reason**: Authentication will be handled by the separate backend. These routes will be removed or replaced with a simple mock auth for development.

### 7. Authentication Components

```
src/components/auth/
├── organization-selector.tsx
├── organization-switcher.tsx
├── sign-in-form.tsx
├── sign-up-form.tsx
└── user-menu.tsx
```

**Reason**: These components depend on server-side auth. Will be removed or replaced with mock auth components.

### 8. Authentication Context and Hooks

```
src/contexts/AuthContext.tsx
src/hooks/useAuth.ts
src/hooks/useOrganization.ts
src/hooks/useOrganizationList.ts
src/hooks/usePermissions.ts
```

**Reason**: These depend on server-side auth. Will be removed or replaced with mock implementations.

### 9. Environment Configuration

```
src/env.mjs
```

**Reason**: Will be simplified to only include frontend environment variables.

---

## Files and Directories to Modify

### 1. Dashboard Pages

#### [`src/app/(platform)/(dashboard)/board/[boardId]/page.tsx`](<src/app/(platform)/(dashboard)/board/[boardId]/page.tsx>)

**Current Issues**:

- Uses `auth()` from Clerk
- Uses `db.list.findMany()` from Prisma
- Server component that fetches data

**Changes Needed**:

- Convert to client component
- Remove auth and db imports
- Fetch data using React Query from API
- Add loading and error states

**New Implementation**:

```tsx
"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { ListContainer } from "../_components/list-container"

interface BoardIdPageProps {
  params: {
    boardId: string
  }
}

export default function BoardIdPage({ params }: BoardIdPageProps) {
  const {
    data: lists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board", params.boardId],
    queryFn: async () => {
      const response = await fetch(`/api/boards/${params.boardId}/lists`)
      if (!response.ok) throw new Error("Failed to fetch lists")
      return response.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="h-full overflow-x-auto p-4">
      <ListContainer boardId={params.boardId} lists={lists || []} />
    </div>
  )
}
```

### 2. Board Components

#### [`src/app/(platform)/(dashboard)/board/_components/list-container.tsx`](<src/app/(platform)/(dashboard)/board/_components/list-container.tsx>)

**Current Issues**:

- Uses server actions (`updateCardPosition`, `updateListPosition`)
- Uses `useAction` hook for server actions

**Changes Needed**:

- Replace server actions with API calls using React Query
- Keep drag and drop functionality
- Update optimistic updates to work with API calls

### 3. Other Dashboard Pages

All pages in `src/app/(platform)/(dashboard)/` that use:

- Server actions → Replace with API calls
- Server components → Convert to client components
- Auth checks → Remove or replace with client-side auth state

### 4. Layout Files

#### [`src/app/(platform)/(dashboard)/layout.tsx`](<src/app/(platform)/(dashboard)/layout.tsx>)

**Changes Needed**:

- Remove server-side auth checks
- Simplify to just render children

### 5. Middleware

#### [`src/middleware.ts`](src/middleware.ts)

**Current**: Complex authentication middleware with JWT verification

**New**: Simple middleware that allows all routes

```typescript
import { NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  // Allow all routes - authentication will be handled by the backend API
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

---

## New Files to Create

### 1. API Client Utilities

#### [`src/lib/api-client.ts`](src/lib/api-client.ts)

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Generic fetch wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Board API
export const boardApi = {
  get: (boardId: string) => apiRequest(`/boards/${boardId}`),
  create: (data: any) =>
    apiRequest("/boards", { method: "POST", body: JSON.stringify(data) }),
  update: (boardId: string, data: any) =>
    apiRequest(`/boards/${boardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (boardId: string) =>
    apiRequest(`/boards/${boardId}`, { method: "DELETE" }),
}

// List API
export const listApi = {
  create: (boardId: string, data: any) =>
    apiRequest(`/boards/${boardId}/lists`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (listId: string, data: any) =>
    apiRequest(`/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (listId: string) =>
    apiRequest(`/lists/${listId}`, { method: "DELETE" }),
  updatePosition: (boardId: string, items: any[]) =>
    apiRequest(`/boards/${boardId}/lists/position`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
}

// Card API
export const cardApi = {
  create: (listId: string, data: any) =>
    apiRequest(`/lists/${listId}/cards`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (cardId: string, data: any) =>
    apiRequest(`/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (cardId: string) =>
    apiRequest(`/cards/${cardId}`, { method: "DELETE" }),
  updatePosition: (boardId: string, items: any[]) =>
    apiRequest(`/boards/${boardId}/cards/position`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
  copy: (cardId: string) =>
    apiRequest(`/cards/${cardId}/copy`, { method: "POST" }),
}
```

### 2. Mock Auth Context (for development)

#### [`src/contexts/MockAuthContext.tsx`](src/contexts/MockAuthContext.tsx)

```typescript
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface MockAuthContextType {
  isAuthenticated: boolean
  userId: string | null
  orgId: string | null
  login: () => void
  logout: () => void
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [userId] = useState("mock-user-id")
  const [orgId] = useState("mock-org-id")

  const login = () => setIsAuthenticated(true)
  const logout = () => setIsAuthenticated(false)

  return (
    <MockAuthContext.Provider value={{ isAuthenticated, userId, orgId, login, logout }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (!context) {
    throw new Error("useMockAuth must be used within MockAuthProvider")
  }
  return context
}
```

### 3. Mock Data (for development)

#### [`src/lib/mock-data.ts`](src/lib/mock-data.ts)

```typescript
export const mockBoards = [
  {
    id: "board-1",
    title: "Project Board",
    imageId: "1",
    imageThumbUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    imageFullUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
  },
]

export const mockLists = [
  {
    id: "list-1",
    title: "To Do",
    boardId: "board-1",
    position: 0,
    cards: [
      { id: "card-1", title: "Task 1", listId: "list-1", position: 0 },
      { id: "card-2", title: "Task 2", listId: "list-1", position: 1 },
    ],
  },
  {
    id: "list-2",
    title: "In Progress",
    boardId: "board-1",
    position: 1,
    cards: [{ id: "card-3", title: "Task 3", listId: "list-2", position: 0 }],
  },
]
```

---

## Package.json Updates

### Dependencies to Remove

```json
{
  "dependencies": {
    "mongoose": "^8.0.0", // Remove
    "jsonwebtoken": "^9.0.0" // Remove
  },
  "devDependencies": {
    "@types/mongoose": "^5.11.97", // Remove
    "@types/jsonwebtoken": "^9.0.0" // Remove
  }
}
```

### Dependencies to Add

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0", // Add (as per AGENTS.md)
    "@dnd-kit/sortable": "^8.0.0", // Add (as per AGENTS.md)
    "@dnd-kit/modifiers": "^7.0.0" // Add (as per AGENTS.md)
  }
}
```

### Migration Note

The project currently uses `@hello-pangea/dnd` for drag and drop. According to AGENTS.md, it should use `@dnd-kit`. This migration can be done in a separate phase. For now, keep `@hello-pangea/dnd` to minimize changes.

---

## Environment Variables

### Update [`.env.example`](.env.example)

```env
# Frontend Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API URL (to be provided by backend developer)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Unsplash (keep for image functionality)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=
NEXT_PUBLIC_UNSPLASH_SECRET_KEY=
```

### Update [`src/env.mjs`](src/env.mjs)

```javascript
export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string().min(1),
    NEXT_PUBLIC_UNSPLASH_SECRET_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY:
      process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_UNSPLASH_SECRET_KEY:
      process.env.NEXT_PUBLIC_UNSPLASH_SECRET_KEY,
  },
})
```

---

## Execution Steps

### Phase 1: Remove Backend Code

1. Delete `src/actions/` directory
2. Delete `src/models/` directory
3. Delete backend libraries from `src/lib/`
4. Delete `src/app/api/` directory
5. Delete `src/middleware.ts`
6. Delete authentication routes
7. Delete authentication components
8. Delete authentication contexts and hooks

### Phase 2: Update Package.json

1. Remove backend dependencies
2. Add frontend dependencies (if needed)
3. Run `pnpm install` to update dependencies

### Phase 3: Create Frontend Infrastructure

1. Create `src/lib/api-client.ts` for API calls
2. Create `src/contexts/MockAuthContext.tsx` for mock auth
3. Create `src/lib/mock-data.ts` for development data

### Phase 4: Update Dashboard Pages

1. Convert server components to client components
2. Replace server actions with API calls
3. Add loading and error states
4. Update drag and drop to use API calls

### Phase 5: Update Components

1. Update components to use mock auth context
2. Remove server action dependencies
3. Update forms to use API calls

### Phase 6: Update Configuration

1. Update `src/env.mjs`
2. Update `.env.example`
3. Create simple middleware

### Phase 7: Testing

1. Start development server
2. Verify no build errors
3. Test UI functionality with mock data
4. Verify drag and drop works
5. Test navigation

---

## Risk Assessment

**Low Risk**: This cleanup is safe because:

1. The backend will be built separately using the same tech stack
2. Frontend UI components are well-structured and can be adapted
3. React Query provides a robust way to handle API calls
4. Mock auth allows development without backend dependency

**Considerations**:

1. Drag and drop library may need migration from `@hello-pangea/dnd` to `@dnd-kit` (per AGENTS.md)
2. Real-time updates will need to be implemented via WebSockets from backend
3. Authentication flow will need to be integrated when backend is ready

---

## Success Criteria

- [ ] Project starts without errors
- [ ] All backend code removed
- [ ] Frontend works with mock data
- [ ] Drag and drop functionality works
- [ ] UI is fully functional
- [ ] Ready for API integration when backend is ready

---

## Notes for Backend Developer

### API Contract

The frontend expects the following API endpoints:

#### Boards

- `GET /api/boards/:boardId` - Get board details
- `POST /api/boards` - Create board
- `PATCH /api/boards/:boardId` - Update board
- `DELETE /api/boards/:boardId` - Delete board
- `GET /api/boards/:boardId/lists` - Get board lists with cards

#### Lists

- `POST /api/boards/:boardId/lists` - Create list
- `PATCH /api/lists/:listId` - Update list
- `DELETE /api/lists/:listId` - Delete list
- `PATCH /api/boards/:boardId/lists/position` - Update list positions

#### Cards

- `POST /api/lists/:listId/cards` - Create card
- `PATCH /api/cards/:cardId` - Update card
- `DELETE /api/cards/:cardId` - Delete card
- `PATCH /api/boards/:boardId/cards/position` - Update card positions
- `POST /api/cards/:cardId/copy` - Copy card
- `GET /api/cards/:cardId/logs` - Get card activity logs

#### Authentication

- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-up` - Sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/me` - Get current user

### Data Models

See the original `src/models/` directory for the expected data structure. The backend should implement these models using MongoDB and Mongoose.

### Fractional Indexing

The frontend expects fractional indexing for positions (as specified in AGENTS.md). The backend should support this for efficient reordering.

### Real-Time Updates

The frontend will need WebSocket support for real-time updates. Consider implementing:

- Board updates
- List updates
- Card updates
- Activity feed updates
