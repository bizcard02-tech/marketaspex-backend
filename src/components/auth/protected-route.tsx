"use client"

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
// Wrapper component to protect routes that require authentication.
// Redirects unauthenticated users to the sign-in page.
// ============================================================================
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuthContext } from "./auth-provider"

// ============================================================================
// TYPES
// ============================================================================

export interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

/**
 * ProtectedRoute - Wraps children components to ensure only authenticated users can access them
 *
 * @param children - The protected content to render
 * @param redirectTo - The path to redirect to if not authenticated (default: "/sign-in")
 * @param fallback - Optional fallback component to show while loading or if not authenticated
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = "/sign-in",
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  /**
   * Redirect to sign-in page if not authenticated
   * Only redirect after loading is complete to avoid unnecessary redirects
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner />
  }

  // If not authenticated, return fallback or null (will redirect via useEffect)
  if (!isAuthenticated) {
    return fallback || null
  }

  // User is authenticated, render protected content
  return <>{children}</>
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default ProtectedRoute
