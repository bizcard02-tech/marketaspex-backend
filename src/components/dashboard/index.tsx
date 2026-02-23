"use client"

import { memo } from "react"

import { BoardList } from "@/components/boards/board-list"

/**
 * Dashboard Component
 *
 * Main dashboard view showing all boards for the authenticated user.
 * This component is displayed at the root path (/) when user is authenticated.
 */
export const Dashboard = memo(function Dashboard() {
  console.log("[Dashboard] Rendering")
  try {
    return (
      <div className="h-full w-full p-6">
        <BoardList />
      </div>
    )
  } catch (error) {
    console.error("[Dashboard] Error:", error)
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Dashboard Error</h2>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    )
  }
})
