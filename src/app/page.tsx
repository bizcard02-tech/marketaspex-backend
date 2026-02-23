"use client"

// ============================================================================
// ROOT PAGE - CONDITIONAL ROUTING
// ============================================================================
// This page handles conditional rendering based on authentication state:
// - If authenticated: redirects to /dashboard (Boards view)
// - If not authenticated: shows the Landing page
// ============================================================================
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

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
// ROOT PAGE COMPONENT
// ============================================================================

/**
 * RootPage - Conditional routing based on authentication state
 *
 * This component serves as the entry point for the application.
 * It checks the user's authentication status and routes accordingly:
 *
 * - Authenticated users → Redirect to /dashboard (Boards view)
 * - Unauthenticated users → Show Landing page
 *
 * The redirect happens client-side after authentication state is loaded.
 */
export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  /**
   * Redirect authenticated users to dashboard
   * Only redirect after loading is complete to avoid unnecessary redirects
   */
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      }
      // If not authenticated, show landing page (no redirect needed)
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If authenticated, return null (will redirect to /dashboard via useEffect)
  if (isAuthenticated) {
    return null
  }

  // Not authenticated - show landing page
  // The landing page is imported from the marketing route group
  const LandingPage = require("@/app/(marketing)/landing-page").LandingPage

  return <LandingPage />
}
