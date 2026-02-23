"use client"

import { DashboardNavbar } from "./_components/dashboard-navbar"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  console.log("[DashboardLayout] Rendering")
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default DashboardLayout
