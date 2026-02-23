import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"

import { getToken, removeToken } from "./auth-utils"
import { isStaticAuthMode, MOCK_TOKEN, MOCK_USER } from "./static-credentials"

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ============================================================================
// STATIC AUTH MODE - FRONTEND ONLY
// ============================================================================
// When static auth mode is enabled, we use mock data instead of backend API.
// This is used for development/testing without a running backend server.
// ============================================================================

/**
 * Check if we should use static mode for this request
 * Static mode is enabled when NEXT_PUBLIC_STATIC_AUTH_MODE=true
 */
function shouldUseStaticMode(): boolean {
  return isStaticAuthMode()
}

// Generic fetch wrapper - COMMENTED OUT FOR STATIC MODE
// This function made actual backend API calls which caused 401 errors
// and triggered hard page redirects, creating a redirect loop.
// Now we use static mock responses when static auth mode is enabled.
/*
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Handle 401 Unauthorized - token expired or invalid
  // CRITICAL FIX: Removed hard redirect that caused redirect loop
  // The hard redirect (window.location.href = "/sign-in") was causing
  // new Node.js processes to spawn and fill Windows Task Manager.
  if (response.status === 401) {
    removeToken()
    // OLD CODE (CAUSED REDIRECT LOOP):
    // if (typeof window !== "undefined") {
    //   window.location.href = "/sign-in"
    // }
    throw new Error("Session expired. Please sign in again.")
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
*/

/**
 * Mock API request function for static mode
 * Returns mock data instead of making backend calls
 */
async function mockApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  console.log(`[mock-api] ${options.method || "GET"} ${endpoint}`, {
    body: options.body,
  })

  // Handle authentication endpoints
  if (endpoint === "/auth/sign-in" && options.method === "POST") {
    const body = JSON.parse(options.body as string)
    // Static credentials validation
    if (body.email === "user@example.com" && body.password === "password123") {
      return {
        user: {
          id: "static-user-001",
          name: "Demo User",
          email: "user@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: MOCK_TOKEN,
      } as T
    }
    if (body.email === "dev@taskflow.local" && body.password === "dev123456") {
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN,
      } as T
    }
    throw new Error("Invalid email or password")
  }

  if (endpoint === "/auth/sign-up" && options.method === "POST") {
    const body = JSON.parse(options.body as string)
    return {
      user: {
        id: "static-user-" + Date.now(),
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: MOCK_TOKEN,
    } as T
  }

  if (endpoint === "/auth/sign-out" && options.method === "POST") {
    return {} as T
  }

  if (endpoint === "/auth/me") {
    return MOCK_USER as T
  }

  // Handle board endpoints (return empty arrays for now)
  if (endpoint === "/boards") {
    return [] as T
  }

  // Default: return empty object for other endpoints
  return {} as T
}

/**
 * Unified API request function that routes to mock or real API
 * For now, always uses mock to avoid backend dependency issues
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Always use mock mode for now to avoid backend issues
  // This can be changed to check shouldUseStaticMode() when backend is ready
  return mockApiRequest<T>(endpoint, options)
}

// Type definitions
export interface Board {
  id: string
  title: string
  imageId: string
  imageThumbUrl: string
  imageFullUrl: string
  orgId: string
  createdAt: string
  updatedAt: string
}

export interface List {
  id: string
  title: string
  position: number
  boardId: string
  cards: Card[]
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  title: string
  description: string | null
  position: number
  listId: string
  createdAt: string
  updatedAt: string
}

export interface CreateBoardInput {
  title: string
  imageId?: string
}

export interface UpdateBoardInput {
  title?: string
  imageId?: string
}

export interface CreateListInput {
  title: string
  boardId: string
}

export interface UpdateListInput {
  title?: string
  position?: number
}

export interface CreateCardInput {
  title: string
  listId: string
  description?: string
}

export interface UpdateCardInput {
  title?: string
  description?: string
  position?: number
}

// Board API
export const boardApi = {
  get: (boardId: string) => apiRequest<Board>(`/boards/${boardId}`),
  getAll: () => apiRequest<Board[]>("/boards"),
  create: (data: CreateBoardInput) =>
    apiRequest<Board>("/boards", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (boardId: string, data: UpdateBoardInput) =>
    apiRequest<Board>(`/boards/${boardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (boardId: string) =>
    apiRequest<void>(`/boards/${boardId}`, { method: "DELETE" }),
}

// List API
export const listApi = {
  create: (boardId: string, data: CreateListInput) =>
    apiRequest<List>(`/boards/${boardId}/lists`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (listId: string, data: UpdateListInput) =>
    apiRequest<List>(`/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (listId: string) =>
    apiRequest<void>(`/lists/${listId}`, { method: "DELETE" }),
  updatePosition: (boardId: string, items: UpdateListInput[]) =>
    apiRequest<void>(`/boards/${boardId}/lists/position`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
}

// Card API
export const cardApi = {
  create: (listId: string, data: CreateCardInput) =>
    apiRequest<Card>(`/lists/${listId}/cards`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (cardId: string, data: UpdateCardInput) =>
    apiRequest<Card>(`/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (cardId: string) =>
    apiRequest<void>(`/cards/${cardId}`, { method: "DELETE" }),
  updatePosition: (boardId: string, items: UpdateCardInput[]) =>
    apiRequest<void>(`/boards/${boardId}/cards/position`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
  copy: (cardId: string) =>
    apiRequest<Card>(`/cards/${cardId}/copy`, { method: "POST" }),
}

// React Query hooks
export function useBoard(boardId: string, options?: UseQueryOptions<Board>) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => boardApi.get(boardId),
    ...options,
  })
}

export function useBoards(options?: UseQueryOptions<Board[]>) {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => boardApi.getAll(),
    ...options,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBoardInput) => boardApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })
}

export function useUpdateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string
      data: UpdateBoardInput
    }) => boardApi.update(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["board", variables.boardId] })
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })
}

export function useDeleteBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (boardId: string) => boardApi.delete(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
    },
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string
      data: CreateListInput
    }) => listApi.create(boardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["board", variables.boardId] })
    },
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: UpdateListInput }) =>
      listApi.update(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (listId: string) => listApi.delete(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: CreateCardInput }) =>
      cardApi.create(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: UpdateCardInput }) =>
      cardApi.update(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => cardApi.delete(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

export function useCopyCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => cardApi.copy(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] })
    },
  })
}

// =====================
// Authentication Types
// =====================

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface AuthError {
  message: string
  code?: string
}

// =====================
// Authentication API
// =====================

const authApi = {
  signIn: (data: SignInInput) =>
    apiRequest<AuthResponse>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  signUp: (data: Omit<SignUpInput, "confirmPassword">) =>
    apiRequest<AuthResponse>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  signOut: () =>
    apiRequest<void>("/auth/sign-out", {
      method: "POST",
    }),
  getMe: () =>
    apiRequest<AuthUser>("/auth/me", {
      method: "GET",
    }),
}

// =====================
// Authentication Hooks
// =====================

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SignInInput) => authApi.signIn(data),
    onSuccess: (data) => {
      // Token and user storage is handled by AuthProvider
      // The AuthProvider will use the auth-utils to store the data
      queryClient.setQueryData(["user"], data.user)
    },
  })
}

export function useSignUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<SignUpInput, "confirmPassword">) =>
      authApi.signUp(data),
    onSuccess: (data) => {
      // Token and user storage is handled by AuthProvider
      queryClient.setQueryData(["user"], data.user)
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      // Token clearing is handled by AuthProvider
      queryClient.clear()
      // Redirect to sign-in page (handled by component)
    },
  })
}

export function useAuthUser(options?: UseQueryOptions<AuthUser>) {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getMe(),
    retry: false,
    ...options,
  })
}
