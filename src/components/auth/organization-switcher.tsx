"use client"

import { siteConfig } from "@/config/site"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

/**
 * Mock organization switcher component for frontend-only mode
 * In production, this would integrate with auth provider
 */
export function OrganizationSwitcher() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
              {siteConfig.name[0]}
            </div>
          </Avatar>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </div>
      </Button>
    </div>
  )
}
