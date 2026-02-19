import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string().optional(),
    NEXT_PUBLIC_UNSPLASH_SECRET_KEY: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY:
      process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
    NEXT_PUBLIC_UNSPLASH_SECRET_KEY:
      process.env.NEXT_PUBLIC_UNSPLASH_SECRET_KEY,
  },
})
