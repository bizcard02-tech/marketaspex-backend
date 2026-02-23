# TASKFLOW ENTERPRISE - FIX IMPLEMENTATION GUIDE

**Document Date:** 2026-02-23  
**Project:** Trello Clone (Taskflow Enterprise)  
**Purpose:** Step-by-step guide for implementing critical fixes

---

## 📋 TABLE OF CONTENTS

1. [Pre-Implementation Checklist](#pre-implementation-checklist)
2. [Implementation Phase 1: Critical Fixes (P0-P1)](#implementation-phase-1-critical-fixes-p0-p1)
3. [Implementation Phase 2: Performance Optimizations (P2-P3)](#implementation-phase-2-performance-optimizations-p2-p3)
4. [Implementation Phase 3: Testing & Validation](#implementation-phase-3-testing--validation)
5. [Rollback Procedures](#rollback-procedures)
6. [Post-Implementation Tasks](#post-implementation-tasks)

---

## ✅ PRE-IMPLEMENTATION CHECKLIST

Before implementing any fixes, complete these preparatory steps:

### Environment Setup

- [ ] Create a new branch for fixes: `git checkout -b fix/critical-auth-issues`
- [ ] Ensure all dependencies are installed: `npm install` or `bun install`
- [ ] Backup current working state: `git commit -am "Backup before fixes"`
- [ ] Create environment variable backup: `cp .env .env.backup`

### Development Tools

- [ ] Ensure Node.js version matches `package.json` requirements
- [ ] Verify Next.js development server can start: `npm run dev`
- [ ] Check database connection (if applicable)
- [ ] Verify browser developer tools are available

### Documentation Review

- [ ] Read [`DEBUGGING_REPORT.md`](DEBUGGING_REPORT.md) for context
- [ ] Review [`REFACTORED_SOLUTIONS.md`](REFACTORED_SOLUTIONS.md) for code changes
- [ ] Understand the root cause and impact of each issue

### Risk Assessment

- [ ] Identify potential breaking changes
- [ ] Plan for data migration (if needed)
- [ ] Prepare rollback strategy
- [ ] Set up monitoring/logging for issues

---

## 🚀 IMPLEMENTATION PHASE 1: CRITICAL FIXES (P0-P1)

### Overview

This phase addresses the most critical issues that block development workflow:

- **P0:** Authentication Redirect Loop
- **P1:** Remove Clerk Authentication

**Estimated Time:** 2-3 hours  
**Risk Level:** HIGH  
**Rollback:** Required

---

## 🔧 FIX #1: Authentication Redirect Loop (P0 - CRITICAL)

### Objective

Replace destructive full-page redirects with client-side navigation and implement circuit breaker pattern to prevent infinite loops.

### Files to Modify

- `src/lib/api-client.ts`

### Step-by-Step Instructions

#### Step 1.1: Backup Original File

```bash
cp src/lib/api-client.ts src/lib/api-client.ts.backup
```

#### Step 1.2: Add Circuit Breaker Configuration

Add the following code after the imports section (around line 13):

```typescript
// ============================================================================
// CIRCUIT BREAKER CONFIGURATION
// ============================================================================

interface CircuitBreakerState {
  isOpen: boolean
  failureCount: number
  lastFailureTime: number
  nextAttemptTime: number
}

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  resetTimeout: 60000,
  backoffBase: 1000,
}

let circuitBreakerState: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  nextAttemptTime: 0,
}
```

#### Step 1.3: Add Circuit Breaker Functions

Add these functions after the circuit breaker configuration:

```typescript
function isCircuitOpen(): boolean {
  const now = Date.now()

  if (
    circuitBreakerState.isOpen &&
    now >= circuitBreakerState.nextAttemptTime
  ) {
    circuitBreakerState.isOpen = false
    circuitBreakerState.failureCount = 0
    console.log("[CircuitBreaker] Circuit auto-reset after timeout")
    return false
  }

  return circuitBreakerState.isOpen
}

function recordFailure(): void {
  circuitBreakerState.failureCount++
  circuitBreakerState.lastFailureTime = Date.now()

  if (
    circuitBreakerState.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold
  ) {
    circuitBreakerState.isOpen = true
    const backoffTime =
      CIRCUIT_BREAKER_CONFIG.backoffBase *
      Math.pow(2, circuitBreakerState.failureCount)
    circuitBreakerState.nextAttemptTime = Date.now() + backoffTime

    console.error(
      `[CircuitBreaker] Circuit opened after ${circuitBreakerState.failureCount} failures. ` +
        `Next attempt in ${backoffTime}ms`
    )
  }
}

function recordSuccess(): void {
  if (circuitBreakerState.failureCount > 0) {
    console.log(
      `[CircuitBreaker] Circuit reset after ${circuitBreakerState.failureCount} failures`
    )
  }
  circuitBreakerState.isOpen = false
  circuitBreakerState.failureCount = 0
}
```

#### Step 1.4: Add Development Mode Detection

Add these helper functions before the `apiRequest` function:

```typescript
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development"
}

function isStaticAuthMode(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_AUTH_MODE === "true"
}
```

#### Step 1.5: Refactor apiRequest Function

Replace the existing `apiRequest` function (lines 15-46) with this enhanced version:

```typescript
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check circuit breaker first
  if (isCircuitOpen()) {
    console.warn(
      `[API] Circuit breaker is open. Skipping request to ${endpoint}. ` +
        `Will retry at ${new Date(circuitBreakerState.nextAttemptTime).toISOString()}`
    )
    throw new Error("Service temporarily unavailable. Please try again later.")
  }

  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    recordFailure()
    removeToken()

    // ✅ FIX: Use client-side navigation instead of full page reload
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname
      if (currentPath !== "/sign-in" && currentPath !== "/sign-up") {
        console.warn("[API] 401 Unauthorized - Redirecting to sign-in")
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: { message: "Session expired. Please sign in again." },
          })
        )
      }
    }

    throw new Error("Session expired. Please sign in again.")
  }

  // Handle 404 Not Found
  if (response.status === 404) {
    console.error(`[API] 404 Not Found: ${endpoint}`)
    throw new Error(`Resource not found: ${endpoint}`)
  }

  // Handle 500 Server Error
  if (response.status >= 500) {
    recordFailure()
    console.error(`[API] Server Error ${response.status}: ${endpoint}`)
    throw new Error(`Server error: ${response.statusText}`)
  }

  // Handle other errors
  if (!response.ok) {
    recordFailure()
    console.error(
      `[API] Request failed: ${response.status} ${response.statusText}`
    )
    throw new Error(`API Error: ${response.statusText}`)
  }

  // Success - record and return
  recordSuccess()
  return response.json()
}
```

#### Step 1.6: Add AuthEventHandler Component

Add this component at the end of the file (before the exports):

```typescript
import { useEffect } from "react"

export function AuthEventHandler() {
  if (typeof window === "undefined") {
    return null
  }

  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      const { message } = event.detail
      console.log("[AuthEventHandler] Unauthorized event received:", message)

      import("next/navigation")
        .then(({ useRouter }) => {
          const router = useRouter()
          router.push("/sign-in")
        })
        .catch((err) => {
          console.error("[AuthEventHandler] Failed to navigate:", err)
          window.location.href = "/sign-in"
        })
    }

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized as EventListener
    )

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized as EventListener
      )
    }
  }, [])

  return null
}
```

#### Step 1.7: Add Health Check Functions

Add these utility functions at the end of the file:

```typescript
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch (error) {
    console.warn("[API] Health check failed:", error)
    return false
  }
}

export async function getApiStatus(): Promise<{
  available: boolean
  message: string
  isStaticMode: boolean
}> {
  const isStatic = isStaticAuthMode()

  if (isStatic) {
    return {
      available: true,
      message: "Using static authentication mode (development)",
      isStaticMode: true,
    }
  }

  const isAvailable = await checkApiHealth()

  if (!isAvailable && isDevelopmentMode()) {
    return {
      available: false,
      message:
        "Backend server not available. Start the backend server or enable static auth mode.",
      isStaticMode: false,
    }
  }

  return {
    available: isAvailable,
    message: isAvailable
      ? "API server is available"
      : "API server is unavailable",
    isStaticMode: false,
  }
}
```

#### Step 1.8: Update Root Layout

Modify `src/app/layout.tsx` to include the `AuthEventHandler`:

```typescript
import { AuthEventHandler } from "@/lib/api-client"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthEventHandler />
        {children}
      </body>
    </html>
  )
}
```

#### Step 1.9: Test the Fix

1. Start the development server: `npm run dev`
2. Open the browser and navigate to the application
3. Open browser console to observe circuit breaker logs
4. Verify no infinite redirect loops occur
5. Check Windows Task Manager - Node.js processes should not multiply

#### Step 1.10: Enable Static Auth Mode (Optional)

If backend server is not available, enable static auth mode:

```bash
# Add to .env.local
NEXT_PUBLIC_STATIC_AUTH_MODE=true
```

Then restart the development server.

### Verification Checklist

- [ ] No infinite redirect loops occur
- [ ] Circuit breaker logs appear in console
- [ ] Windows Task Manager shows stable process count
- [ ] Application loads successfully
- [ ] Static auth mode works (if enabled)

### Rollback Procedure

If issues occur:

```bash
cp src/lib/api-client.ts.backup src/lib/api-client.ts
git checkout src/app/layout.tsx
npm run dev
```

---

## 🔧 FIX #2: Remove Clerk Authentication (P1 - HIGH)

### Objective

Remove all Clerk authentication references and consolidate to single JWT-based authentication system.

### Files to Modify

- `src/app/(platform)/(dashboard)/board/[boardId]/layout.tsx`
- `src/middleware.ts` (create or update)
- All other files with Clerk imports

### Step-by-Step Instructions

#### Step 2.1: Create JWT Server Utilities

Create new file `src/lib/jwt-server.ts`:

```typescript
import { cookies } from "next/headers"

import { TokenPayload } from "./auth-utils"

interface VerifyTokenOptions {
  throwOnError?: boolean
}

export async function verifyToken(
  token: string,
  options: VerifyTokenOptions = {}
): Promise<TokenPayload | null> {
  const { throwOnError = false } = options

  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = Buffer.from(payload, "base64").toString()
    const parsed = JSON.parse(decoded) as TokenPayload

    const now = Math.floor(Date.now() / 1000)
    if (parsed.exp < now) {
      return null
    }

    return parsed
  } catch (error) {
    console.error("Failed to verify token:", error)
    if (throwOnError) {
      throw error
    }
    return null
  }
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return null
  }

  return payload.sub
}

export async function getAuthenticatedUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getAuthenticatedUserId()) !== null
}
```

#### Step 2.2: Update Board Layout

Modify `src/app/(platform)/(dashboard)/board/[boardId]/layout.tsx`:

**Remove:**

```typescript
import { auth } from "@clerk/nextjs"
```

**Replace with:**

```typescript
import { getAuthenticatedUserId } from "@/lib/jwt-server"
```

**Replace the generateMetadata function:**

```typescript
export async function generateMetadata({
  params,
}: {
  params: { boardId: string }
}): Promise<Metadata> {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    return {
      title: "Board",
    }
  }

  // TODO: Get user's organization from database
  const orgId = null // Replace with actual org lookup

  if (!orgId) {
    return {
      title: "Board",
    }
  }

  const board = await db.board.findUnique({
    where: {
      id: params.boardId,
      orgId,
    },
  })

  return {
    title: startCase(board?.title || "board"),
  }
}
```

**Replace the BoardIdLayout component:**

```typescript
const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: { boardId: string }
}) => {
  const userId = await getAuthenticatedUserId()

  if (!userId) {
    redirect("/sign-in")
  }

  // TODO: Get user's organization from database
  const orgId = null // Replace with actual org lookup

  if (!orgId) {
    redirect("/organization/create")
  }

  const board = await db.board.findUnique({
    where: {
      id: params.boardId,
      orgId,
    },
  })

  if (!board) {
    redirect(`/organization/${orgId}`)
  }

  return (
    <div className="relative h-full flex-1">
      <BoardNavbar board={board} />
      <Image
        src={board.imageFullUrl}
        alt={`${board.title}'s image`}
        fill
        className="absolute inset-0 -z-10 object-cover object-center brightness-75 filter"
      />
      <main className="relative h-full pt-28">{children}</main>
    </div>
  )
}
```

#### Step 2.3: Find All Clerk References

Search for all Clerk imports in the project:

```bash
grep -r "@clerk" src/ --include="*.ts" --include="*.tsx"
```

#### Step 2.4: Remove Clerk Dependencies

Remove Clerk packages from `package.json`:

```bash
npm uninstall @clerk/nextjs @clerk/clerk-react
```

Or if using bun:

```bash
bun remove @clerk/nextjs @clerk/clerk-react
```

#### Step 2.5: Create or Update Middleware

Create or update `src/middleware.ts`:

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { verifyToken } from "@/lib/jwt-server"

const PROTECTED_ROUTES = ["/board", "/organization", "/dashboard"]

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  const payload = await verifyToken(token)

  if (!payload) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

#### Step 2.6: Update Auth Utils for Cookie Support

Modify `src/lib/auth-utils.ts` to support cookies for SSR:

**Add these functions:**

```typescript
/**
 * Get token from cookies (for server-side)
 * This is a placeholder - implement proper cookie handling
 */
export function getTokenFromCookies(): string | null {
  if (typeof window !== "undefined") {
    return null
  }

  // Server-side cookie handling
  // This should be implemented using Next.js cookies()
  return null
}

/**
 * Set token in cookies (for server-side)
 * This is a placeholder - implement proper cookie handling
 */
export function setTokenInCookies(token: string): void {
  // Server-side cookie handling
  // This should be implemented using Next.js cookies()
}
```

#### Step 2.7: Test the Fix

1. Restart the development server: `npm run dev`
2. Navigate to a protected route (e.g., `/board`)
3. Verify redirect to `/sign-in` occurs
4. Sign in with valid credentials
5. Verify access to protected routes

### Verification Checklist

- [ ] All Clerk imports removed
- [ ] Clerk packages uninstalled
- [ ] JWT authentication works
- [ ] Protected routes redirect correctly
- [ ] Middleware functions properly

### Rollback Procedure

If issues occur:

```bash
git checkout src/app/(platform)/(dashboard)/board/[boardId]/layout.tsx
git checkout src/middleware.ts
rm src/lib/jwt-server.ts
npm install @clerk/nextjs @clerk/clerk-react
npm run dev
```

---

## ⚡ IMPLEMENTATION PHASE 2: PERFORMANCE OPTIMIZATIONS (P2-P3)

### Overview

This phase addresses performance issues:

- **P2:** Optimize Token Validation
- **P3:** Configure React Query Cache
- **P3:** Consolidate Authentication State

**Estimated Time:** 1-2 hours  
**Risk Level:** MEDIUM  
**Rollback:** Optional

---

## 🔧 FIX #3: Optimize Token Validation (P2 - MEDIUM-HIGH)

### Objective

Add memoization and caching to token validation to prevent excessive localStorage reads.

### Files to Modify

- `src/lib/auth-utils.ts`

### Step-by-Step Instructions

#### Step 3.1: Backup Original File

```bash
cp src/lib/auth-utils.ts src/lib/auth-utils.ts.backup
```

#### Step 3.2: Add Token Validation Cache

Add this code after the TYPES section (around line 35):

```typescript
interface TokenValidationCache {
  isValid: boolean
  token: string | null
  timestamp: number
  expiresAt: number
}

let tokenValidationCache: TokenValidationCache | null = null

const CACHE_TTL = 5000 // 5 seconds

export function clearTokenValidationCache(): void {
  tokenValidationCache = null
}

function getCachedValidation(): TokenValidationCache | null {
  if (!tokenValidationCache) {
    return null
  }

  const now = Date.now()

  if (now > tokenValidationCache.expiresAt) {
    tokenValidationCache = null
    return null
  }

  return tokenValidationCache
}

function setCachedValidation(isValid: boolean, token: string | null): void {
  const now = Date.now()
  tokenValidationCache = {
    isValid,
    token,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  }
}
```

#### Step 3.3: Update setToken Function

Modify the `setToken` function to clear cache:

```typescript
export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(TOKEN_KEY, token)
    clearTokenValidationCache() // Add this line
  } catch (error) {
    console.error("Failed to store token in localStorage:", error)
  }
}
```

#### Step 3.4: Update removeToken Function

Modify the `removeToken` function to clear cache:

```typescript
export function removeToken(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(TOKEN_KEY)
    clearTokenValidationCache() // Add this line
  } catch (error) {
    console.error("Failed to remove token from localStorage:", error)
  }
}
```

#### Step 3.5: Refactor hasValidToken Function

Replace the existing `hasValidToken` function:

```typescript
export function hasValidToken(): boolean {
  // Check cache first
  const cached = getCachedValidation()

  if (cached) {
    const currentToken = getToken()
    if (cached.token === currentToken) {
      return cached.isValid
    }
  }

  // Cache miss or token changed, perform validation
  const token = getToken()
  const isValid = token ? isTokenValid(token) : false

  // Update cache
  setCachedValidation(isValid, token)

  return isValid
}
```

#### Step 3.6: Update Exports

Add the cache function to exports:

```typescript
export const tokenUtils = {
  getToken,
  setToken,
  removeToken,
  decodeToken,
  isTokenValid,
  hasValidToken,
  getTokenTimeRemaining,
  clearTokenValidationCache, // Add this line
}
```

#### Step 3.7: Test the Fix

1. Open browser console
2. Navigate to the application
3. Monitor localStorage read operations
4. Verify cache logs appear
5. Check performance improvements

### Verification Checklist

- [ ] Token validation is cached
- [ ] Cache is cleared on token changes
- [ ] localStorage reads reduced significantly
- [ ] No performance degradation

### Rollback Procedure

```bash
cp src/lib/auth-utils.ts.backup src/lib/auth-utils.ts
npm run dev
```

---

## 🔧 FIX #4: Configure React Query Cache (P3 - MEDIUM)

### Objective

Add comprehensive cache configuration to React Query to prevent unnecessary refetches.

### Files to Modify

- `src/components/providers/query-provider.tsx`

### Step-by-Step Instructions

#### Step 4.1: Backup Original File

```bash
cp src/components/providers/query-provider.tsx src/components/providers/query-provider.tsx.backup
```

#### Step 4.2: Replace Entire File Content

Replace the entire file content with the refactored version from [`REFACTORED_SOLUTIONS.md`](REFACTORED_SOLUTIONS.md#solution-4-configure-react-query-cache).

#### Step 4.3: Test the Fix

1. Restart development server
2. Navigate to application
3. Open React Query DevTools (if installed)
4. Verify cache settings are applied
5. Monitor network requests

### Verification Checklist

- [ ] Cache configuration applied
- [ ] Unnecessary refetches reduced
- [ ] Performance improved
- [ ] No breaking changes

### Rollback Procedure

```bash
cp src/components/providers/query-provider.tsx.backup src/components/providers/query-provider.tsx
npm run dev
```

---

## 🔧 FIX #5: Consolidate Authentication State (P3 - MEDIUM)

### Objective

Establish React Query as single source of truth for authentication state.

### Files to Modify

- `src/components/auth/auth-provider.tsx`

### Step-by-Step Instructions

#### Step 5.1: Backup Original File

```bash
cp src/components/auth/auth-provider.tsx src/components/auth/auth-provider.tsx.backup
```

#### Step 5.2: Replace Entire File Content

Replace the entire file content with the refactored version from [`REFACTORED_SOLUTIONS.md`](REFACTORED_SOLUTIONS.md#solution-5-consolidate-authentication-state).

#### Step 5.3: Test the Fix

1. Restart development server
2. Sign in with credentials
3. Verify authentication state
4. Check React Query DevTools
5. Monitor memory usage

### Verification Checklist

- [ ] React Query is single source of truth
- [ ] No duplicate user state
- [ ] Authentication works correctly
- [ ] Memory usage reduced

### Rollback Procedure

```bash
cp src/components/auth/auth-provider.tsx.backup src/components/auth/auth-provider.tsx
npm run dev
```

---

## 🧪 IMPLEMENTATION PHASE 3: TESTING & VALIDATION

### Overview

Comprehensive testing to ensure all fixes work correctly and don't introduce regressions.

**Estimated Time:** 1-2 hours  
**Risk Level:** LOW

---

### Test Suite #1: Authentication Flow Testing

#### Test 1.1: Sign In Flow

1. Navigate to `/sign-in`
2. Enter valid credentials
3. Click sign in
4. **Expected:** Redirect to dashboard, user authenticated

#### Test 1.2: Sign Out Flow

1. Sign in to application
2. Click sign out
3. **Expected:** Redirect to `/sign-in`, token cleared

#### Test 1.3: Token Expiration

1. Sign in with short-lived token
2. Wait for token to expire
3. Navigate to protected route
4. **Expected:** Redirect to `/sign-in`, no infinite loop

#### Test 1.4: Invalid Credentials

1. Navigate to `/sign-in`
2. Enter invalid credentials
3. Click sign in
4. **Expected:** Error message, stay on sign-in page

---

### Test Suite #2: Circuit Breaker Testing

#### Test 2.1: Circuit Opens After Failures

1. Stop backend server
2. Make 3+ API calls
3. **Expected:** Circuit opens, subsequent calls skipped

#### Test 2.2: Circuit Resets After Timeout

1. Wait for circuit timeout (60 seconds)
2. Make API call
3. **Expected:** Circuit resets, call attempted

#### Test 2.3: Circuit Logs

1. Open browser console
2. Trigger circuit breaker
3. **Expected:** Circuit breaker logs visible

---

### Test Suite #3: Performance Testing

#### Test 3.1: Token Validation Performance

1. Open browser DevTools Performance tab
2. Navigate to application
3. Monitor localStorage reads
4. **Expected:** < 5 reads per second (down from 20-50)

#### Test 3.2: React Query Cache Performance

1. Open React Query DevTools
2. Navigate between pages
3. Monitor query refetches
4. **Expected:** Minimal unnecessary refetches

#### Test 3.3: Memory Usage

1. Open browser Task Manager
2. Navigate to application
3. Monitor memory usage
4. **Expected:** Stable memory, no leaks

---

### Test Suite #4: Regression Testing

#### Test 4.1: Board Access

1. Sign in
2. Navigate to `/board/[boardId]`
3. **Expected:** Board loads correctly

#### Test 4.2: Organization Access

1. Sign in
2. Navigate to `/organization/[orgId]`
3. **Expected:** Organization loads correctly

#### Test 4.3: Card Operations

1. Sign in
2. Navigate to board
3. Create/edit/delete cards
4. **Expected:** All operations work

---

### Test Suite #5: Edge Cases

#### Test 5.1: Network Offline

1. Disconnect network
2. Navigate to application
3. **Expected:** Graceful error handling

#### Test 5.2: Multiple Tabs

1. Open application in multiple tabs
2. Sign out in one tab
3. **Expected:** All tabs redirect to sign-in

#### Test 5.3: Browser Refresh

1. Sign in to application
2. Refresh browser
3. **Expected:** User remains authenticated

---

## 🔄 ROLLBACK PROCEDURES

### Complete Rollback (All Fixes)

If all fixes need to be reverted:

```bash
# Restore all backup files
cp src/lib/api-client.ts.backup src/lib/api-client.ts
cp src/lib/auth-utils.ts.backup src/lib/auth-utils.ts
cp src/components/providers/query-provider.tsx.backup src/components/providers/query-provider.tsx
cp src/components/auth/auth-provider.tsx.backup src/components/auth/auth-provider.tsx

# Restore original files
git checkout src/app/(platform)/(dashboard)/board/[boardId]/layout.tsx
git checkout src/middleware.ts
git checkout src/app/layout.tsx

# Remove new files
rm src/lib/jwt-server.ts

# Reinstall Clerk (if needed)
npm install @clerk/nextjs @clerk/clerk-react

# Restart server
npm run dev
```

### Partial Rollback (Individual Fixes)

#### Rollback Fix #1 Only

```bash
cp src/lib/api-client.ts.backup src/lib/api-client.ts
git checkout src/app/layout.tsx
npm run dev
```

#### Rollback Fix #2 Only

```bash
git checkout src/app/(platform)/(dashboard)/board/[boardId]/layout.tsx
git checkout src/middleware.ts
rm src/lib/jwt-server.ts
npm install @clerk/nextjs @clerk/clerk-react
npm run dev
```

#### Rollback Fix #3 Only

```bash
cp src/lib/auth-utils.ts.backup src/lib/auth-utils.ts
npm run dev
```

#### Rollback Fix #4 Only

```bash
cp src/components/providers/query-provider.tsx.backup src/components/providers/query-provider.tsx
npm run dev
```

#### Rollback Fix #5 Only

```bash
cp src/components/auth/auth-provider.tsx.backup src/components/auth/auth-provider.tsx
npm run dev
```

---

## 📋 POST-IMPLEMENTATION TASKS

### Immediate Tasks (After Implementation)

#### Task 1: Clean Up Backup Files

```bash
rm src/lib/api-client.ts.backup
rm src/lib/auth-utils.ts.backup
rm src/components/providers/query-provider.tsx.backup
rm src/components/auth/auth-provider.tsx.backup
```

#### Task 2: Commit Changes

```bash
git add .
git commit -m "fix: resolve critical authentication and performance issues

- Fix authentication redirect loop with circuit breaker pattern
- Remove Clerk authentication, consolidate to JWT
- Optimize token validation with memoization
- Configure React Query cache for better performance
- Consolidate authentication state to single source of truth

Resolves: Critical system instability and performance degradation"
```

#### Task 3: Update Documentation

- [ ] Update README with new authentication flow
- [ ] Document static auth mode usage
- [ ] Update API documentation
- [ ] Add troubleshooting guide

#### Task 4: Monitor Production

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor API error rates
- [ ] Track authentication success rates
- [ ] Monitor performance metrics

---

### Follow-Up Tasks (Within 1 Week)

#### Task 1: Implement Proper JWT Verification

Replace the placeholder JWT verification in `src/lib/jwt-server.ts` with proper verification using a library like `jose`:

```bash
npm install jose
```

Then implement proper token verification with signature validation.

#### Task 2: Add Organization Lookup

Implement the TODO items in board layout to fetch user's organization from the database.

#### Task 3: Add Error Boundaries

Implement React error boundaries for graceful error handling.

#### Task 4: Add Loading States

Implement proper loading states for better UX during authentication.

#### Task 5: Add Unit Tests

Write unit tests for:

- Circuit breaker functionality
- Token validation caching
- Authentication flow
- React Query cache behavior

---

### Long-Term Tasks (Within 1 Month)

#### Task 1: Implement Real-Time Updates

Add WebSocket support for real-time board updates.

#### Task 2: Add Audit Logging

Implement comprehensive audit logging for authentication events.

#### Task 3: Add Rate Limiting

Implement API rate limiting to prevent abuse.

#### Task 4: Add Analytics

Add analytics to track authentication metrics and performance.

#### Task 5: Performance Monitoring

Set up continuous performance monitoring and alerting.

---

## 📊 SUCCESS METRICS

### Performance Metrics

- [ ] Page load time < 2 seconds
- [ ] Time to interactive < 3 seconds
- [ ] localStorage reads < 5 per second
- [ ] API error rate < 1%
- [ ] Memory usage stable (no leaks)

### Authentication Metrics

- [ ] Sign-in success rate > 95%
- [ ] Sign-in time < 2 seconds
- [ ] Token validation time < 10ms
- [ ] Circuit breaker activation rate < 5%

### User Experience Metrics

- [ ] No infinite redirect loops
- [ ] Smooth navigation between pages
- [ ] Clear error messages
- [ ] Responsive UI during loading

---

## 🎯 CONCLUSION

This implementation guide provides step-by-step instructions for resolving all critical issues identified in the debugging report. By following this guide, you should be able to:

1. **Fix the authentication redirect loop** preventing infinite reloads
2. **Remove conflicting authentication systems** for better performance
3. **Optimize token validation** reducing localStorage overhead
4. **Configure React Query cache** minimizing unnecessary API calls
5. **Consolidate authentication state** eliminating redundancy

**Remember to:**

- Test thoroughly after each fix
- Commit changes incrementally
- Monitor for regressions
- Keep backups for rollback
- Document any deviations from this guide

**Estimated Total Implementation Time:** 4-7 hours  
**Risk Level:** MEDIUM (with rollback procedures)  
**Expected Outcome:** Stable, performant application with unified authentication

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-23  
**Next Review:** After implementation completion
