export type CardWithList = {
  id: string
  title: string
  description: string | null
  order: number
  listId: string
  list: {
    id: string
    title: string
  }
  createdAt: Date
  updatedAt: Date
}

export type ListWithCards = {
  id: string
  title: string
  order: number
  boardId: string
  cards: CardWithList[]
  createdAt: Date
  updatedAt: Date
}

export type BoardWithLists = {
  id: string
  title: string
  imageId: string | null
  orgId: string
  lists: ListWithCards[]
  createdAt: Date
  updatedAt: Date
}

export type Organization = {
  id: string
  title: string
  slug: string
  userId: string
  createdAt: Date
  updatedAt: Date
}
