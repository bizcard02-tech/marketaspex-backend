"use client"

import { useMemo } from "react"

/**
 * Mock organization list hook for frontend-only mode
 * In production, this would integrate with auth provider
 */
export function useOrganizationList() {
  const userMemberships = useMemo(
    () => [
      {
        organization: {
          _id: "mock-org-1",
          name: "Market Aspex",
          slug: "market-aspex",
          imageUrl: undefined,
        },
      },
    ],
    []
  )

  return { userMemberships, isLoading: false }
}
