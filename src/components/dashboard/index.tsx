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
  return (
    <div className="h-full w-full">
      <BoardList />
    </div>
  )
})
