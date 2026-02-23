import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { createSafeAction } from "@/lib/create-safe-action"
import { useAction } from "@/hooks/use-action"

const DeleteCardSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  listId: z.string(),
})

type InputType = z.infer<typeof DeleteCardSchema>

export const deleteCard = createSafeAction(
  DeleteCardSchema,
  async (data: InputType) => {
    try {
      // For now, just return success
      // In production, this would call an API to delete the card
      return {
        data: { ...data },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to delete card",
      }
    }
  }
)
