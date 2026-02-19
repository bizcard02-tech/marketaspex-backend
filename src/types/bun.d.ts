/**
 * Bun Type Declarations
 *
 * Type definitions for Bun's built-in APIs.
 */

declare global {
  const Bun: {
    /**
     * Password hashing and verification utilities
     */
    password: {
      /**
       * Hash a password using argon2id
       */
      hash(password: string): Promise<string>

      /**
       * Verify a password against a hash
       */
      verify(password: string, hash: string): Promise<boolean>
    }
  }
}

export {}
