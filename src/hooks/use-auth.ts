// ============================================================================
// UNIFIED AUTHENTICATION HOOK
// ============================================================================
// Convenient hook for accessing authentication state and methods.
// This is the primary interface for components to interact with authentication.
// ============================================================================

import { useAuthContext } from "@/components/auth/auth-provider"
import type { AuthContextType } from "@/components/auth/auth-provider"

// ============================================================================
// USE AUTH HOOK
// ============================================================================

/**
 * useAuth - Hook for accessing authentication state and methods
 *
 * This hook provides a convenient interface for components to access
 * authentication state and methods without directly using the context.
 *
 * @returns AuthContextType - The authentication context value
 *
 * @throws Error if used outside of an AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, signIn, signOut } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <PleaseSignIn />
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  return useAuthContext()
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default useAuth
