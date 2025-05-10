import type { BoardRole } from '@/constants/boardRoles'

const BASE_URL = 'http://localhost:8080/api/users/boards/roles'

export async function fetchUserBoardRoles(userId: number, boardId: number): Promise<BoardRole[]> {
  const url = `${BASE_URL}?userId=${userId}&boardId=${boardId}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    return []
  }
  const data = await res.json()
  // API возвращает массив объектов, ищем нужный board и возвращаем boardRoles
  const entry = Array.isArray(data.content) ? data.content.find((r: any) => r.user.id === userId && r.board.id === boardId) : null
  return entry?.boardRoles || []
}

export async function fetchAllUserBoardRoles(userId: number): Promise<Record<number, BoardRole[]>> {
  const url = `${BASE_URL}?userId=${userId}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    return {}
  }
  const data = await res.json()
  const result: Record<number, BoardRole[]> = {}
  if (Array.isArray(data.content)) {
    data.content.forEach((entry: any) => {
      result[entry.board.id] = entry.boardRoles
    })
  }
  return result
}
