import React from "react"

import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ModalProvider } from "@/components/providers/modal-provider"

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <>
        {children}
        <Toaster />
        <ModalProvider />
      </>
    </ProtectedRoute>
  )
}

export default PlatformLayout
