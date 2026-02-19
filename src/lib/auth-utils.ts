// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================
// Centralized token and user management utilities for JWT-based authentication
// This module provides a clean interface for token storage, validation, and
// user data management without any mock data or placeholder services.
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

export const TOKEN_KEY = "auth_token"
export const USER_KEY = "auth_user"

// ============================================================================
// TYPES
// ============================================================================

export interface TokenPayload {
  sub: string // User ID
  email: string
  name?: string
  iat: number // Issued at timestamp
  exp: number // Expiration timestamp
}

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/**
 * Retrieve the authentication token from localStorage
 * @returns The stored token or null if not found
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error("Failed to retrieve token from localStorage:", error)
    return null
  }
}

/**
 * Store the authentication token in localStorage
 * @param token - The JWT token to store
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error("Failed to store token in localStorage:", error)
  }
}

/**
 * Remove the authentication token from localStorage
 */
export function removeToken(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error("Failed to remove token from localStorage:", error)
  }
}

/**
 * Decode a JWT token without verification (client-side only)
 * Note: This does not verify the token signature. Verification should
 * happen on the server. This is used for client-side expiration checks.
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload)
    return JSON.parse(decoded) as TokenPayload
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

/**
 * Check if a token is valid (exists and not expired)
 * @param token - The JWT token to validate
 * @returns True if the token is valid, false otherwise
 */
export function isTokenValid(token: string): boolean {
  if (!token) {
    return false
  }

  const payload = decodeToken(token)
  if (!payload) {
    return false
  }

  // Check if token has expired
  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

/**
 * Check if the stored token is valid
 * @returns True if a valid token exists, false otherwise
 */
export function hasValidToken(): boolean {
  const token = getToken()
  return token ? isTokenValid(token) : false
}

/**
 * Get the time remaining until token expiration in milliseconds
 * @param token - The JWT token to check
 * @returns Time remaining in milliseconds, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeToken(token)
  if (!payload) {
    return 0
  }

  const now = Math.floor(Date.now() / 1000)
  const remaining = (payload.exp - now) * 1000
  return Math.max(0, remaining)
}

// ============================================================================
// USER UTILITIES
// ============================================================================

/**
 * Retrieve the authenticated user from localStorage
 * @returns The stored user or null if not found
 */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) {
      return null
    }
    return JSON.parse(userJson) as AuthUser
  } catch (error) {
    console.error("Failed to retrieve user from localStorage:", error)
    return null
  }
}

/**
 * Store the authenticated user in localStorage
 * @param user - The user object to store
 */
export function setUser(user: AuthUser): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error("Failed to store user in localStorage:", error)
  }
}

/**
 * Remove the authenticated user from localStorage
 */
export function removeUser(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error("Failed to remove user from localStorage:", error)
  }
}

// ============================================================================
// COMBINED UTILITIES
// ============================================================================

/**
 * Clear all authentication data (token and user)
 */
export function clearAuthData(): void {
  removeToken()
  removeUser()
}

/**
 * Set all authentication data (token and user)
 * @param token - The JWT token to store
 * @param user - The user object to store
 */
export function setAuthData(token: string, user: AuthUser): void {
  setToken(token)
  setUser(user)
}

/**
 * Check if user is authenticated (has valid token and user data)
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return hasValidToken() && getUser() !== null
}

// ============================================================================
// EXPORT OBJECTS FOR CONVENIENCE
// ============================================================================

export const tokenUtils = {
  getToken,
  setToken,
  removeToken,
  decodeToken,
  isTokenValid,
  hasValidToken,
  getTokenTimeRemaining,
}

export const userUtils = {
  getUser,
  setUser,
  removeUser,
}

export const authUtils = {
  clearAuthData,
  setAuthData,
  isAuthenticated,
  ...tokenUtils,
  ...userUtils,
}
