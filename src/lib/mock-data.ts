import { Board, Card, List } from "./api-client"

export const mockBoards: Board[] = [
  {
    id: "board-1",
    title: "Project Board",
    imageId: "1",
    imageThumbUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    imageFullUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    orgId: "mock-org-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "board-2",
    title: "Marketing Campaign",
    imageId: "2",
    imageThumbUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    imageFullUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
    orgId: "mock-org-id",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockLists: List[] = [
  {
    id: "list-1",
    title: "To Do",
    position: 0,
    boardId: "board-1",
    cards: [
      {
        id: "card-1",
        title: "Research competitors",
        description: "Analyze top 5 competitors in the market",
        position: 0,
        listId: "list-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "card-2",
        title: "Create wireframes",
        description: "Design initial wireframes for the product",
        position: 1,
        listId: "list-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "list-2",
    title: "In Progress",
    position: 1,
    boardId: "board-1",
    cards: [
      {
        id: "card-3",
        title: "Develop landing page",
        description: "Build the main landing page with React",
        position: 0,
        listId: "list-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "list-3",
    title: "Done",
    position: 2,
    boardId: "board-1",
    cards: [
      {
        id: "card-4",
        title: "Setup project",
        description: "Initialize Next.js project with TypeScript",
        position: 0,
        listId: "list-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
