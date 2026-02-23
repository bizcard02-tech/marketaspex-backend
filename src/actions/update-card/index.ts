import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { createSafeAction } from "@/lib/create-safe-action"
import { useAction } from "@/hooks/use-action"

const UpdateCardSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
})

type InputType = z.infer<typeof UpdateCardSchema>

export const updateCard = createSafeAction(
  UpdateCardSchema,
  async (data: InputType) => {
    try {
      // For now, just return success
      // In production, this would call an API to update the card
      return {
        data: { ...data },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to update card",
      }
    }
  }
)
