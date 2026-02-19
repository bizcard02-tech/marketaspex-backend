"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

/**
 * Mock user menu component for frontend-only mode
 * In production, this would integrate with auth provider
 */
export function UserMenu() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-sm font-bold text-white">
              U
            </div>
          </Avatar>
          <span className="hidden sm:inline">User</span>
        </div>
      </Button>
    </div>
  )
}
