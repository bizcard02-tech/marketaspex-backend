# Dashboard Blank Screen Fix

## Problem Analysis

The dashboard route (`/dashboard`) is displaying a blank screen because there is **no `page.tsx` file** in the `src/app/(platform)/(dashboard)/` directory.

### Root Cause

In Next.js App Router, every route must have a `page.tsx` file to render content. The dashboard directory currently has:

- ✅ `layout.tsx` - Wraps content with `DashboardNavbar`
- ❌ `page.tsx` - **MISSING** - This is the file that should render the dashboard content

### Current Architecture Flow

```
User navigates to /dashboard
    ↓
src/app/(platform)/(dashboard)/layout.tsx (exists)
    ↓
src/app/(platform)/(dashboard)/page.tsx (MISSING!)
    ↓
BLANK SCREEN
```

### Existing Components

The following components already exist and are ready to use:

1. **Dashboard Component** (`src/components/dashboard/index.tsx`)
   - Renders a `BoardList` component
   - Displays all boards for the authenticated user

2. **BoardList Component** (`src/components/boards/board-list.tsx`)
   - Fetches boards using `useBoards()` hook
   - Displays boards in a grid layout
   - Includes a "New Board" card

3. **Dashboard Layout** (`src/app/(platform)/(dashboard)/layout.tsx`)
   - Wraps children with `DashboardNavbar`
   - Provides consistent navigation across dashboard pages

### Data Flow

```
Dashboard Component
    ↓
BoardList Component
    ↓
useBoards() hook (from api-client.ts)
    ↓
boardApi.getAll() → /boards endpoint
    ↓
Returns Board[] array
```

### Secondary Issue: Mock API Returns Empty Array

The [`mockApiRequest()`](src/lib/api-client.ts:76-141) function in [`api-client.ts`](src/lib/api-client.ts:76) returns an empty array for boards:

```typescript
// Line 135-137 in api-client.ts
if (endpoint === "/boards") {
  return [] as T
}
```

This means even after fixing the missing `page.tsx`, the dashboard will show an empty board list.

Mock board data exists in [`src/lib/mock-data.ts`](src/lib/mock-data.ts:1) but is not being used.

---

## Solution

### Step 1: Create Dashboard Page File

Create `src/app/(platform)/(dashboard)/page.tsx` with the following content:

```typescript
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  return <Dashboard />
}
```

### Step 2: Update Mock API to Return Mock Boards

Update the [`mockApiRequest()`](src/lib/api-client.ts:76-141) function in [`src/lib/api-client.ts`](src/lib/api-client.ts:1) to return mock board data:

```typescript
// Import mock data at the top
import { mockBoards } from "./mock-data"

// Update the boards endpoint handler (around line 135-137)
if (endpoint === "/boards") {
  return mockBoards as T
}
```

---

## Corrected Code Files

### File: `src/app/(platform)/(dashboard)/page.tsx`

```typescript
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  return <Dashboard />
}
```

### File: `src/lib/api-client.ts` (Partial Update)

Add import at the top:

```typescript
import { getToken, removeToken } from "./auth-utils"
import { mockBoards } from "./mock-data" // ADD THIS IMPORT
import { isStaticAuthMode, MOCK_TOKEN, MOCK_USER } from "./static-credentials"
```

Update the boards endpoint handler (around line 135-137):

```typescript
// Handle board endpoints
if (endpoint === "/boards") {
  return mockBoards as T // RETURN MOCK DATA INSTEAD OF EMPTY ARRAY
}
```

---

## Expected Result After Fix

After applying both fixes, the dashboard will:

1. ✅ Render the dashboard layout with navbar
2. ✅ Display the "Your Boards" heading
3. ✅ Show mock boards in a grid layout:
   - "Project Board"
   - "Marketing Campaign"
4. ✅ Include a "New Board" card for creating new boards

### Visual Hierarchy

```
Dashboard Layout
├── Dashboard Navbar
└── Dashboard Page
    └── BoardList
        ├── "Your Boards" heading with user icon
        └── Grid of Boards
            ├── Project Board (card with image)
            ├── Marketing Campaign (card with image)
            └── New Board card (create button)
```

---

## Additional Notes

### Workspace/Organization Hierarchy

The current implementation shows all boards for the user. According to the task description, the dashboard should display:

> "the expected hierarchy of workspaces and the boards contained within them"

The current [`useOrganizationList()`](src/hooks/useOrganizationList.ts:9) hook returns a mock organization:

```typescript
{
  _id: "mock-org-1",
  name: "Market Aspex",
  slug: "market-aspex",
  imageUrl: undefined,
}
```

To fully implement workspace hierarchy, the BoardList component could be enhanced to:

1. Group boards by organization/workspace
2. Display organization headers
3. Show boards under each organization

This would require:

- Adding `orgId` to the Board interface (already exists)
- Grouping boards by `orgId` in the BoardList component
- Fetching organization data to display organization names

### Future Enhancements

- Add loading states while fetching boards
- Add error handling for failed API calls
- Implement workspace/organization grouping
- Add filtering and search functionality
- Support real-time board updates
