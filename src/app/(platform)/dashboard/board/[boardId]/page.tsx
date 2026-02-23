"use client"

import { useQuery } from "@tanstack/react-query"

import { mockLists } from "@/lib/mock-data"

import { ListContainer } from "../_components/list-container"

interface BoardIdPageProps {
  params: {
    boardId: string
  }
}

export default function BoardIdPage({ params }: BoardIdPageProps) {
  // For development, use mock data. When backend is ready, use API calls:
  // const { data: lists, isLoading, error } = useQuery({
  //   queryKey: ["board", params.boardId],
  //   queryFn: async () => {
  //     const response = await fetch(`/api/boards/${params.boardId}/lists`)
  //     if (!response.ok) throw new Error("Failed to fetch lists")
  //     return response.json()
  //   },
  // })

  // if (isLoading) return <div>Loading...</div>
  // if (error) return <div>Error: {error.message}</div>

  // Filter mock lists for this board
  const lists = mockLists.filter((list) => list.boardId === params.boardId)

  return (
    <div className="h-full overflow-x-auto p-4">
      <ListContainer boardId={params.boardId} lists={lists} />
    </div>
  )
}
