// ============================================================================
// STATIC AUTHENTICATION UTILITIES
// ============================================================================
// This module provides static credential validation for development/testing
// without requiring a running backend server.
// ============================================================================

import type { AuthUser } from "./api-client"
import {
  isStaticAuthMode,
  MOCK_TOKEN,
  MOCK_USER,
  validateStaticCredentials as validateCreds,
} from "./static-credentials"

/**
 * Validate credentials against static values
 * @param email - User's email
 * @param password - User's password
 * @returns true if credentials match, false otherwise
 */
export function validateStaticCredentials(
  email: string,
  password: string
): boolean {
  return validateCreds(email, password)
}

/**
 * Get static auth response (simulates API response)
 * @returns AuthResponse with mock user and token
 */
export function getStaticAuthResponse() {
  return {
    user: MOCK_USER,
    token: MOCK_TOKEN,
  }
}

/**
 * Check if static auth is enabled and validate credentials
 * @param email - User's email
 * @param password - User's password
 * @returns AuthResponse if valid, null otherwise
 */
export function authenticateStatic(
  email: string,
  password: string
): { user: AuthUser; token: string } | null {
  if (!isStaticAuthMode()) {
    return null
  }

  if (validateStaticCredentials(email, password)) {
    return getStaticAuthResponse()
  }

  return null
}
