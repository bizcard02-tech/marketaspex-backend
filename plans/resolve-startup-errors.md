# Resolve Startup Errors - Fix Plan

## Problem Analysis

The project is failing to start with two critical errors:

### Error 1: Route Conflict

```
Error: You cannot define a route with the same specificity as a optional catch-all route
("/select-org" and "/select-org[[...select-org]]").
```

**Root Cause**: The project has duplicate routes for authentication pages:

| Route Path                                                         | Type               | Purpose                   | Status               |
| ------------------------------------------------------------------ | ------------------ | ------------------------- | -------------------- |
| `src/app/(platform)/(clerk)/select-org/[[...select-org]]/page.tsx` | Optional catch-all | Clerk-based org selection | ❌ Should be removed |
| `src/app/(platform)/select-org/page.tsx`                           | Regular route      | JWT-based org selection   | ✅ Should be kept    |
| `src/app/(platform)/(clerk)/sign-in/[[...sign-in]]/page.tsx`       | Optional catch-all | Clerk-based sign-in       | ❌ Should be removed |
| `src/app/(platform)/sign-in/page.tsx`                              | Regular route      | JWT-based sign-in         | ✅ Should be kept    |
| `src/app/(platform)/(clerk)/sign-up/[[...sign-in]]/page.tsx`       | Optional catch-all | Clerk-based sign-up       | ❌ Should be removed |
| `src/app/(platform)/sign-up/page.tsx`                              | Regular route      | JWT-based sign-up         | ✅ Should be kept    |

**Why This Happens**: Next.js cannot have two routes with the same path specificity. The optional catch-all route `[[...select-org]]` conflicts with the regular route `select-org`.

### Error 2: Middleware Import Error

```
Error: NextRequest is not defined
```

**Root Cause**: In [`src/middleware.ts`](src/middleware.ts:16), the function signature uses `NextRequest` but it's not imported.

```typescript
export default async function middleware(req: NextRequest) {
  // ❌ NextRequest not imported
  // ...
}
```

### Warning: Middleware Deprecation

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Note**: This is a warning, not an error. It indicates that Next.js is moving from `middleware.ts` to a new `proxy` convention. This can be addressed later as it doesn't block startup.

---

## Solution Plan

### Step 1: Remove Clerk Routes Directory

**Action**: Delete the entire `src/app/(platform)/(clerk)/` directory.

**Rationale**: According to the migration plan ([`plans/clerk-to-jwt-mongodb-migration.md`](plans/clerk-to-jwt-mongodb-migration.md:790)), Phase 7 explicitly states:

> #### Files to Delete:
>
> - `src/app/(platform)/(clerk)/` - Entire directory

The project is migrating from Clerk authentication to custom JWT-based authentication. The JWT routes are already implemented and functional in:

- `src/app/(platform)/sign-in/page.tsx`
- `src/app/(platform)/sign-up/page.tsx`
- `src/app/(platform)/select-org/page.tsx`

**Files to Delete**:

```
src/app/(platform)/(clerk)/layout.tsx
src/app/(platform)/(clerk)/select-org/[[...select-org]]/page.tsx
src/app/(platform)/(clerk)/sign-in/[[...sign-in]]/page.tsx
src/app/(platform)/(clerk)/sign-up/[[...sign-in]]/page.tsx
```

### Step 2: Fix Middleware Import Error

**Action**: Add the missing `NextRequest` import to [`src/middleware.ts`](src/middleware.ts).

**Change**:

```typescript
// Before:
// After:
import { NextRequest, NextResponse, NextResponse } from "next/server"

import { verifyAuthCookie, verifyAuthCookie } from "@/lib/server-auth"
```

### Step 3: Document Middleware Deprecation Warning

**Action**: Add a comment to [`src/middleware.ts`](src/middleware.ts) documenting the deprecation warning for future reference.

**Rationale**: While this doesn't block startup, it's important to document for future maintenance. The migration to the new `proxy` convention can be addressed when the project is stable.

---

## Execution Steps

1. **Delete Clerk routes directory**
   - Remove `src/app/(platform)/(clerk)/` and all its contents

2. **Fix middleware import**
   - Add `NextRequest` to the import statement in `src/middleware.ts`

3. **Verify the fix**
   - Start the development server
   - Confirm no route conflict errors
   - Confirm no import errors

---

## Expected Outcome

After implementing these changes:

✅ The project starts without errors
✅ JWT-based authentication routes are functional
✅ Middleware correctly validates authentication
✅ Users can sign in, sign up, and select organizations

---

## Migration Context

This fix aligns with the broader migration from Clerk to JWT authentication as outlined in [`plans/clerk-to-jwt-mongodb-migration.md`](plans/clerk-to-jwt-mongodb-migration.md). The project is in the middle of this migration, and removing the Clerk routes is a necessary step to complete Phase 7 of the migration plan.

**Current Migration Status**:

- ✅ MongoDB models created
- ✅ JWT infrastructure implemented
- ✅ Server actions updated
- ✅ Client components updated
- ✅ Middleware updated (with import bug)
- ✅ JWT-based authentication UI created
- ⏳ Clerk routes cleanup (this fix)
- ⏳ Environment configuration updates
- ⏳ Testing and validation

---

## Risk Assessment

**Low Risk**: These changes are safe to implement because:

1. The JWT-based authentication system is already implemented and tested
2. The Clerk routes are not being used (middleware is already using JWT)
3. The migration plan explicitly calls for removing these routes
4. The middleware fix is a simple import addition

**No Data Loss**: No database changes are involved. This is purely a code cleanup.
