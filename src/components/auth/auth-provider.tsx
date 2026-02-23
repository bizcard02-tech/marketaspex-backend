"use client"

// ============================================================================
// AUTHENTICATION CONTEXT PROVIDER
// ============================================================================
// Centralized authentication state management for JWT-based authentication.
// This provider manages authentication state, token validation, and provides
// methods for sign in, sign up, and sign out operations.
// ============================================================================
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

import { useAuthUser, useSignIn, useSignOut, useSignUp } from "@/lib/api-client"
import { authUtils, TOKEN_KEY, type AuthUser } from "@/lib/auth-utils"
import { authenticateStatic } from "@/lib/static-auth-utils"
import { isStaticAuthMode } from "@/lib/static-credentials"

// ============================================================================
// TYPES
// ============================================================================

export interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean
  user: AuthUser | null
  isLoading: boolean
  error: string | null

  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  // Local state for authentication
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // React Query mutations and queries
  const signInMutation = useSignIn()
  const signUpMutation = useSignUp()
  const signOutMutation = useSignOut()
  const { data: apiUser, refetch: refetchUser } = useAuthUser({
    queryKey: ["user"],
    enabled: authUtils.hasValidToken(),
    retry: false,
  })

  // ============================================================================
  // INITIALIZATION & TOKEN VALIDATION
  // ============================================================================

  /**
   * Initialize authentication state on mount
   * - Check for valid token
   * - Load user from localStorage
   * - Validate token expiration
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if we have a valid token
        const hasToken = authUtils.hasValidToken()

        if (!hasToken) {
          // No valid token, clear any stale data
          authUtils.clearAuthData()
          setUser(null)
          setIsLoading(false)
          return
        }

        // We have a valid token, load user from localStorage
        const storedUser = authUtils.getUser()
        if (storedUser) {
          setUser(storedUser)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Failed to initialize auth:", err)
        authUtils.clearAuthData()
        setUser(null)
        setError("Failed to initialize authentication")
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Sync API user data with local state
   * This keeps the local user state in sync with the server
   */
  useEffect(() => {
    if (apiUser) {
      setUser(apiUser)
      authUtils.setUser(apiUser)
    }
  }, [apiUser])

  /**
   * Listen for storage events to handle multi-tab authentication
   * When a user signs out in one tab, all tabs should reflect the change
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY && event.newValue === null) {
        // Token was removed in another tab
        setUser(null)
        setError("Session expired")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Sign in with email and password
   * @param email - User's email address
   * @param password - User's password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null)
      setIsLoading(true)

      try {
        let result: { user: AuthUser; token: string }

        // Check if static auth mode is enabled
        if (isStaticAuthMode()) {
          const staticResult = authenticateStatic(email, password)
          if (!staticResult) {
            throw new Error("Invalid email or password")
          }
          result = staticResult
        } else {
          // Use API-based authentication
          result = await signInMutation.mutateAsync({ email, password })
        }

        // Store token and user data
        authUtils.setAuthData(result.token, result.user)

        // Update local state
        setUser(result.user)

        setIsLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to sign in"
        setError(message)
        setIsLoading(false)
        throw err
      }
    },
    [signInMutation]
  )

  /**
   * Sign up with name, email, and password
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   */
  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null)
      setIsLoading(true)

      try {
        let result: { user: AuthUser; token: string }

        // Check if static auth mode is enabled
        if (isStaticAuthMode()) {
          // Static mode: create mock user and token
          const staticUser: AuthUser = {
            id: "static-user-" + Date.now(),
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          result = {
            user: staticUser,
            token: "static-token-" + Date.now(),
          }
        } else {
          // Use API-based authentication
          result = await signUpMutation.mutateAsync({
            name,
            email,
            password,
          })
        }

        // Store token and user data
        authUtils.setAuthData(result.token, result.user)

        // Update local state
        setUser(result.user)

        setIsLoading(false)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create account"
        setError(message)
        setIsLoading(false)
        throw err
      }
    },
    [signUpMutation]
  )

  /**
   * Sign out and clear all authentication data
   */
  const signOut = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Call sign out API to invalidate token on server
      await signOutMutation.mutateAsync()
    } catch (err) {
      // Continue with local sign out even if API call fails
      console.error("Sign out API call failed:", err)
    } finally {
      // Clear local authentication data
      authUtils.clearAuthData()
      setUser(null)

      setIsLoading(false)
    }
  }, [signOutMutation])

  /**
   * Refresh user data from the server
   * Useful when user data changes in another tab or component
   */
  const refreshUser = useCallback(async () => {
    if (!authUtils.hasValidToken()) {
      return
    }

    try {
      const result = await refetchUser()
      if (result.data) {
        setUser(result.data)
        authUtils.setUser(result.data)
      }
    } catch (err) {
      console.error("Failed to refresh user:", err)
    }
  }, [refetchUser])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    isAuthenticated: authUtils.hasValidToken() && user !== null,
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================================
// CUSTOM HOOK FOR USING AUTH CONTEXT
// ============================================================================

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
