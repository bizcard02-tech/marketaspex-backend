import { z } from "zod"

import { boardApi } from "@/lib/api-client"
import { createSafeAction } from "@/lib/create-safe-action"

const CreateBoardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  image: z.object({
    imageFullUrl: z.string().url(),
    imageHtmlLink: z.string().url(),
    imageId: z.string(),
    imageThumbUrl: z.string().url(),
    imageUsername: z.string(),
  }),
})

type InputType = z.infer<typeof CreateBoardSchema>

export const createBoard = createSafeAction(
  CreateBoardSchema,
  async (data: InputType) => {
    try {
      const result = await boardApi.create({
        title: data.title,
        imageId: data.image.imageId,
      })

      return {
        data: result,
      }
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create board",
      }
    }
  }
)
