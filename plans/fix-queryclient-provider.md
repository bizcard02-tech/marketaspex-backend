# Fix QueryClientProvider Setup

## Problem Analysis

The application is throwing the following error when accessing sign-in and sign-up pages:

```
Error: No QueryClient set, use QueryClientProvider to set one
    at useSignIn (src\lib\api-client.ts:356:37)
    at SignInForm (src\components\auth\sign-in-form.tsx:25:35)
```

### Root Cause

1. The [`QueryProvider`](src/components/providers/query-provider.tsx:1) component exists and is properly implemented
2. However, it is **not being used** anywhere in the application
3. The root layout at [`src/app/layout.tsx`](src/app/layout.tsx:64) only wraps children with `ThemeProvider`
4. Both [`SignInForm`](src/components/auth/sign-in-form.tsx:25) and [`SignUpForm`](src/components/auth/sign-up-form.tsx:25) use hooks (`useSignIn` and `useSignUp`) that call `useQueryClient()` from `@tanstack/react-query`
5. Without `QueryClientProvider`, these hooks fail with "No QueryClient set" error

## Solution

Wrap the entire application with `QueryProvider` in the root layout. This ensures React Query is available throughout the app.

### Implementation Steps

1. **Update Root Layout** (`src/app/layout.tsx`)
   - Import `QueryProvider` from `@/components/providers/query-provider`
   - Wrap `ThemeProvider` with `QueryProvider` (or vice versa)
   - This makes React Query available to all pages and components

### Architecture Considerations

Following the AGENTS.md principles:

- **Server-first**: The root layout remains a server component, only the providers are client components
- **Performance**: `QueryProvider` is minimal and uses React Query's efficient caching
- **Scalability**: Single QueryClient instance for the entire app is the recommended pattern
- **Real-time ready**: React Query is the foundation for future real-time updates

### File Changes

**File: `src/app/layout.tsx`**

```diff
+ import { QueryProvider } from "@/components/providers/query-provider"

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          inter.className
        )}
      >
+       <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
+       </QueryProvider>
      </body>
    </html>
  )
}
```

## Verification

After implementing the fix:

1. Navigate to `/sign-in` - should display without errors
2. Navigate to `/sign-up` - should display without errors
3. Forms should render and be interactive
4. No "No QueryClient set" errors in console

## Additional Notes

- The [`QueryProvider`](src/components/providers/query-provider.tsx:7) already has optimal configuration with `refetchOnWindowFocus: false`
- The provider uses `useState` to ensure the QueryClient is only created once
- This fix will also enable all other React Query hooks throughout the application
