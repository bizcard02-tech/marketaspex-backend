# Fix Workspace/Organization Functionality

## Problem Analysis

The workspace/organization functionality exists but has several issues that prevent it from working correctly after the migration from Clerk to JWT-based authentication.

### Issues Identified

1. **Mock Data Structure Mismatch**
   - [`useOrganization`](src/hooks/useOrganization.ts:9) hook returns organization with `id` property
   - [`useOrganizationList`](src/hooks/useOrganizationList.ts:9) hook returns simple array of organizations
   - [`SidebarItem`](<src/app/(platform)/(dashboard)/_components/sidebar-item.tsx:16>) component expects organizations with `_id` property
   - [`DashboardSidebar`](<src/app/(platform)/(dashboard)/_components/sidebar.tsx:30>) expects `userMemberships` with structure `{ organization: { _id, ... } }`

2. **Hardcoded Names**
   - [`useOrganization`](src/hooks/useOrganization.ts:13) returns hardcoded "Taskify" instead of "Market Aspex"
   - [`useOrganizationList`](src/hooks/useOrganizationList.ts:14) returns hardcoded "Taskify"
   - [`OrganizationSwitcher`](src/components/auth/organization-switcher.tsx:25) displays hardcoded "Taskify"

3. **Clerk Dependency**
   - [`BoardList`](src/components/boards/board-list.tsx:13) component uses `auth()` from `@clerk/nextjs`
   - This will fail since we've migrated to JWT-based authentication

## Solution

### 1. Fix Mock Hooks Structure

**File: `src/hooks/useOrganization.ts`**

```diff
export function useOrganization() {
  const organization = useMemo(
    () => ({
-     id: "mock-org-1",
+     _id: "mock-org-1",
-     name: "Taskify",
+     name: "Market Aspex",
      slug: "market-aspex",
      imageUrl: null,
    }),
    []
  )

  return organization
}
```

**File: `src/hooks/useOrganizationList.ts`**

```diff
export function useOrganizationList() {
-   const organizations = useMemo(
-     () => [
-       {
-         id: "mock-org-1",
-         name: "Taskify",
-         slug: "taskify",
-         imageUrl: null,
-       },
-     ],
-     []
-   )
-
-   return organizations
+   const userMemberships = useMemo(
+     () => [
+       {
+         organization: {
+           _id: "mock-org-1",
+           name: "Market Aspex",
+           slug: "market-aspex",
+           imageUrl: null,
+         },
+       },
+     ],
+     []
+   )
+
+   return { userMemberships, isLoading: false }
}
```

### 2. Update Organization Switcher

**File: `src/components/auth/organization-switcher.tsx`**

```diff
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
+ import { siteConfig } from "@/config/site"

export function OrganizationSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
-             T
+             {siteConfig.name[0]}
            </div>
          </Avatar>
-         <span className="hidden sm:inline">Taskify</span>
+         <span className="hidden sm:inline">{siteConfig.name}</span>
        </div>
      </Button>
    </div>
  )
}
```

### 3. Fix BoardList Component

**File: `src/components/boards/board-list.tsx`**

The BoardList component currently uses Clerk's `auth()` function. Since we've migrated to JWT-based authentication, this needs to be updated to use the new auth context or API client.

**Option 1: Use Mock Auth Context** (temporary solution for frontend-only mode)

```diff
import Link from "next/link"
- import { redirect } from "next/navigation"
import { getBoards } from "@/actions/get-board"
- import { auth } from "@clerk/nextjs"

import { db } from "@/lib/db"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

import { NewBoardCard } from "./forms/new-board"

export const BoardList = async () => {
-   const { orgId } = auth()
-   if (!orgId) redirect("/select-org")
+   // For frontend-only mode, use mock orgId
+   const orgId = "mock-org-1"
+
+   // In production, this would be:
+   // const { user } = await getCurrentUser()
+   // const orgId = user.organizationId

  const orgLimit = await db.orgLimit.findUnique({
    where: {
      orgId,
    },
  })
  const { data: boards } = await getBoards()
  return (
    // ... rest of component
  )
}
```

**Option 2: Convert to Client Component** (better for React Query integration)

```diff
+ "use client"

import Link from "next/link"
- import { redirect } from "next/navigation"
- import { getBoards } from "@/actions/get-board"
- import { auth } from "@clerk/nextjs"

- import { db } from "@/lib/db"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"
+ import { useBoards } from "@/lib/api-client"

import { NewBoardCard } from "./forms/new-board"

export const BoardList = () => {
+   const { data: boards, isLoading } = useBoards()
+   const { organization } = useOrganization()

  if (isLoading) {
    return <BoardList.Skeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center text-lg font-semibold text-muted-foreground">
        <Icons.user className="icon-sm mr-2" />
        Your Boards
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {boards?.map((board) => (
          <Link
            href={`/board/${board.id}`}
            key={board.id}
            className="group relative aspect-video h-full w-full overflow-hidden rounded-sm bg-accent bg-cover bg-center bg-no-repeat p-2"
            style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
          >
            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
            <p className="relative font-semibold text-white">
              {board.title}
            </p>
          </Link>
        ))}
        <NewBoardCard remainingBoards={0} />
      </div>
    </div>
  )
}
```

## Implementation Steps

1. Update `useOrganization` hook to use `_id` and "Market Aspex"
2. Update `useOrganizationList` hook to return `userMemberships` structure
3. Update `OrganizationSwitcher` to use `siteConfig.name`
4. Fix `BoardList` component to remove Clerk dependency

## Architecture Considerations

Following AGENTS.md principles:

- **Real-time ready**: The hooks are structured to support future real-time updates
- **Performance**: Using React Query for data fetching (Option 2 above)
- **Scalability**: Mock data structure matches expected production API shape
- **Permission-ready**: Hooks can be extended to include role/permission checks

## Notes

- These are temporary mock implementations for frontend-only mode
- In production, these hooks would integrate with the JWT-based authentication system
- The organization switcher and sidebar will work correctly once the backend API is connected
