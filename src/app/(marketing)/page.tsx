import React from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { AppLogo } from "@/components/ui/logo"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

// Navbar component
const Navbar = () => {
  return (
    <div className="fixed top-0 flex h-14 w-full items-center border-b bg-background px-4 shadow-sm">
      <div className="mx-auto flex w-full items-center justify-between md:max-w-screen-2xl">
        <AppLogo />
        <div className="flex w-full items-center justify-center space-x-4 md:w-auto">
          <ModeToggle />
          <Button variant={"outline"} asChild size="sm">
            <Link href="/sign-in" prefetch={"auto"}>
              Login
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up" prefetch={"auto"}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Footer component
const Footer = () => {
  return (
    <div className="fixed bottom-0 w-full border-t bg-background p-4">
      <div className="mx-auto flex w-full items-center justify-between md:max-w-screen-2xl">
        <AppLogo />
        <div className="flex w-full items-center justify-center gap-4 md:block md:w-auto">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Terms
          </Link>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center pb-16 pt-14">
        <div className="container flex max-w-[64rem] flex-col items-center gap-8 text-center">
          <Icons.logo className="h-20 w-20" />
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 md:gap-12">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icons.layout className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Organize Everything</h3>
              <p className="text-sm text-muted-foreground">
                Manage projects, tasks, and workflows with intuitive boards
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icons.activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Collaborate Seamlessly</h3>
              <p className="text-sm text-muted-foreground">
                Work together in real-time with your entire team
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icons.refreshCcw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Boost Productivity</h3>
              <p className="text-sm text-muted-foreground">
                Streamline workflows and accomplish more, together
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
export { LandingPage }
