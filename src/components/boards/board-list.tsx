"use client"

import Link from "next/link"

import { useBoards } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons"

import { NewBoardCard } from "./forms/new-board"

export const BoardList = () => {
  const { data: boards, isLoading, error } = useBoards()

  console.log("[BoardList] State:", { isLoading, error, boards })

  if (isLoading) {
    console.log("[BoardList] Showing skeleton")
    return <BoardList.Skeleton />
  }

  if (error) {
    console.log("[BoardList] Showing error:", error)
    return (
      <div className="flex items-center justify-center p-6 text-red-500">
        Error loading boards:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    )
  }

  console.log("[BoardList] Rendering boards:", boards)

  try {
    return (
      <div className="space-y-4">
        <div className="flex items-center text-lg font-semibold text-muted-foreground">
          <Icons.user className="icon-sm mr-2" />
          Your Boards
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {boards && boards.length > 0 ? (
            boards.map((board) => (
              <Link
                href={`/board/${board.id}`}
                key={board.id}
                className="group relative aspect-video h-full w-full overflow-hidden rounded-sm bg-accent bg-cover bg-center bg-no-repeat p-2"
                style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
              >
                <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
                <p className="relative font-semibold text-white">
                  {board.title}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No boards found. Create your first board to get started!
            </div>
          )}
          <NewBoardCard remainingBoards={0} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("[BoardList] Render error:", error)
    return (
      <div className="flex items-center justify-center p-6 text-red-500">
        Error rendering boards:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    )
  }
}
BoardList.Skeleton = function BoardListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
      <Skeleton className="aspect-video h-full w-full p-2" />
    </div>
  )
}
