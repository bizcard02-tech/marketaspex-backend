/**
 * Mock database connection for frontend-only mode
 * This provides a stub that matches the expected interface
 */

export const db = {
  // Mock database client
  // In a real application, this would be a Prisma client or similar
  // For frontend-only mode, we provide a stub to satisfy imports
  client: {
    $transaction: async () => ({}),
    $disconnect: async () => {},
    $connect: async () => {},
  },
}
