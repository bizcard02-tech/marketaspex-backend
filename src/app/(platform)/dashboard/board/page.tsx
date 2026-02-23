"use client"

import { redirect } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { useOrganization } from "@/hooks/useOrganization"

function BoardPage() {
  const { isAuthenticated } = useAuth()
  const { organization } = useOrganization()

  // This page is already protected by ProtectedRoute in platform layout
  // But we add an additional check for safety
  if (!isAuthenticated) {
    redirect("/sign-in")
  }

  // Redirect to organization page
  // If no organization exists, user needs to create or select one
  if (!organization) {
    // For now, redirect to a placeholder or create organization page
    // This can be enhanced later with organization selection
    redirect("/create-organization")
  }

  redirect(`/organization/${organization._id}`)
}

export default BoardPage
