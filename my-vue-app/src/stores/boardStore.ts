import { defineStore } from 'pinia'
import { websocketConfig } from '@/config/websocket.config'
import type { Board } from '@/components/boards/types'

// Derive REST base URL from websocket config
const baseUrl = websocketConfig.serverUrl.replace(/\/ws$/, '')

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [] as Board[],
    loading: false,
    error: null as string | null,
    // ID последней открытой доски, загружается из localStorage
    currentBoardId: (typeof localStorage !== 'undefined' && localStorage.getItem('currentBoardId'))
      ? Number(localStorage.getItem('currentBoardId'))
      : null as number | null,
  }),
  getters: {
    // Возвращает все доски
    allBoards: (state) => state.boards,
    // Находит доску по ID
    boardById: (state) => (id: number) => state.boards.find(b => b.id === id),
    // Количество досок
    boardsCount: (state) => state.boards.length,
    // Есть ли ошибка
    hasError: (state) => !!state.error,
  },
  actions: {
    // Установить текущую доску и сохранить в localStorage
    setCurrentBoard(id: number) {
      this.currentBoardId = id
      if (typeof localStorage !== 'undefined') localStorage.setItem('currentBoardId', id.toString())
    },
    async fetchBoards(page = 0, size = 1000) {
      this.loading = true
      try {
        const res = await fetch(`${baseUrl}/api/boards?page=${page}&size=${size}`)
        const data = await res.json()
        this.boards = data.content.map((b: any) => ({
          id: b.id,
          title: b.name,
          description: b.description,
          scope: b.scope,
          owner: b.owner,
          membersCount: b.membersCount ?? 0,
          tasksCount: b.tasksCount ?? 0,
        }))
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async createBoard(name: string, description: string = 'Новая доска') {
      try {
        const res = await fetch(`${baseUrl}/api/boards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, scope: 'PRIVATE' }),
        })
        const board = await res.json()
        const newBoard = {
          id: board.id,
          title: board.name,
          description: board.description || description,
          scope: board.scope,
          owner: board.owner,
          membersCount: board.membersCount ?? 0,
          tasksCount: board.tasksCount ?? 0,
        }
        this.boards.push(newBoard)
      } catch (e: any) {
        this.error = e.message
      }
    },
    async updateBoard(id: number, data: { name: string; description?: string; scope?: string }) {
      try {
        const res = await fetch(`${baseUrl}/api/boards/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, description: data.description, scope: data.scope }),
        })
        const updated = await res.json()
        const idx = this.boards.findIndex(b => b.id === id)
        if (idx !== -1) {
          this.boards[idx] = {
            id: updated.id,
            title: updated.name,
            description: updated.description,
            scope: updated.scope,
            owner: updated.owner,
            membersCount: updated.membersCount ?? 0,
            tasksCount: updated.tasksCount ?? 0,
          }
        }
      } catch (e: any) {
        this.error = e.message
      }
    },
    async deleteBoard(id: number) {
      try {
        await fetch(`${baseUrl}/api/boards/${id}`, { method: 'DELETE' })
        this.boards = this.boards.filter(b => b.id !== id)
      } catch (e: any) {
        this.error = e.message
      }
    },
  },
})
