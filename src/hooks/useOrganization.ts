"use client"

import { useMemo } from "react"

/**
 * Mock organization hook for frontend-only mode
 * In production, this would integrate with auth provider
 */
export function useOrganization() {
  const organization = useMemo(
    () => ({
      _id: "mock-org-1",
      name: "Market Aspex",
      slug: "market-aspex",
      imageUrl: undefined,
    }),
    []
  )

  return { organization, isLoading: false }
}
