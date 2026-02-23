"use client"

import Link from "next/link"
import { useLocalStorage } from "usehooks-ts"

import { useOrganization } from "@/hooks/useOrganization"
import { useOrganizationList } from "@/hooks/useOrganizationList"
import { Accordion } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

import { Organization, SidebarItem } from "./sidebar-item"

interface DashboardSidebarProps {
  // Key to store which sidebar items are expanded in local storage
  storageKey?: string
}

export const DashboardSidebar = ({
  storageKey = "t-dashboard-sidebar-state",
}: DashboardSidebarProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  )

  const { organization: activeOrg, isLoading: isOrgLoading } = useOrganization()
  const { userMemberships, isLoading: isOrgListLoading } = useOrganizationList()

  const defaultAccordionValue: string[] = Object.keys(expanded).reduce(
    (acc: string[], key: string) => {
      if (expanded[key]) {
        acc.push(key)
      }
      return acc
    },
    []
  )
  const onExpand = (id: string) => {
    setExpanded((cur) => ({
      ...cur,
      [id]: !expanded[id],
    }))
  }

  if (isOrgLoading || isOrgListLoading) {
    return (
      <>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-10 w-[60%]" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <SidebarItem.Skeleton />
          <SidebarItem.Skeleton />
          <SidebarItem.Skeleton />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-1 flex items-center text-xs font-medium">
        <span className="pl-4">Workspaces</span>
        <Button
          asChild
          type="button"
          size={"icon"}
          variant="ghost"
          className="ml-auto"
        >
          <Link href="/select-org">
            <Icons.plus className="icon-sm" />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="space-y-2"
      >
        {userMemberships.map((membership) => (
          <SidebarItem
            key={membership.organization._id}
            isActive={activeOrg?._id === membership.organization._id}
            isExpanded={expanded[membership.organization._id]}
            onExpand={() => onExpand(membership.organization._id)}
            organization={membership.organization}
          />
        ))}
      </Accordion>
    </>
  )
}
