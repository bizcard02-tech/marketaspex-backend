import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Market Aspex",
  author: "Market Aspex",
  description:
    "Collaborate, manage projects, and reach new productivity peaks. From high rises to the home office, the way your team works is unique - accomplish it all with Market Aspex.",
  keywords: [
    "project management",
    "task management",
    "collaboration",
    "productivity",
    "teamwork",
    "kanban",
    "agile",
  ],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
  },
  links: {},
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
  icons: [
    {
      url: "/logo.svg",
      href: "/logo.svg",
    },
  ],
}
