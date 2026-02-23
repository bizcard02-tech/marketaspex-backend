// ============================================================================
// STATIC CREDENTIALS FOR DEVELOPMENT MODE
// ============================================================================
// This file contains hardcoded credentials for development/testing without backend.
// WARNING: Never use these credentials in production!
// ============================================================================

import type { AuthUser } from "@/lib/api-client"

/**
 * Static credentials for development mode
 * These credentials bypass API authentication for frontend development
 *
 * DEFAULT CREDENTIALS (for easy testing):
 * - Email: user@example.com
 * - Password: password123
 *
 * DEV CREDENTIALS (for developer testing):
 * - Email: dev@taskflow.local
 * - Password: dev123456
 */
export const STATIC_CREDENTIALS = {
  email: "user@example.com",
  password: "password123",
} as const

/**
 * Additional dev credentials (alternative login)
 */
export const DEV_CREDENTIALS = {
  email: "dev@taskflow.local",
  password: "dev123456",
} as const

/**
 * Mock user object for static authentication
 */
export const MOCK_USER: AuthUser = {
  id: "static-user-001",
  name: "Demo User",
  email: "user@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Mock JWT token for static authentication
 */
export const MOCK_TOKEN = "static-auth-token-frontend-only"

/**
 * Check if static auth mode is enabled
 */
export function isStaticAuthMode(): boolean {
  if (typeof window === "undefined") return false
  const isEnabled = process.env.NEXT_PUBLIC_STATIC_AUTH_MODE === "true"
  console.log(
    "[static-credentials] isStaticAuthMode:",
    isEnabled,
    "NEXT_PUBLIC_STATIC_AUTH_MODE:",
    process.env.NEXT_PUBLIC_STATIC_AUTH_MODE
  )
  return isEnabled
}

/**
 * Validate credentials against static values
 * Supports both default and dev credentials
 */
export function validateStaticCredentials(
  email: string,
  password: string
): boolean {
  return (
    (email === STATIC_CREDENTIALS.email &&
      password === STATIC_CREDENTIALS.password) ||
    (email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password)
  )
}
