import { defineStore } from 'pinia'
import { apiFetch } from '@/api/apiFetch'
import { urlConfig } from '@/config/websocket.config'
import type { Board } from '@/components/boards/types'
import { subscribe, unsubscribe } from '@/lib/websocket'

const baseUrl = urlConfig.restUrl

export const useBoardStore = defineStore('board', {
  state: () => ({
    boards: [] as Board[],
    loading: false,
    error: null as string | null,
    currentBoardId: (typeof localStorage !== 'undefined' && localStorage.getItem('currentBoardId'))
      ? Number(localStorage.getItem('currentBoardId'))
      : null as number | null,
  }),
  getters: {
    allBoards: (state) => state.boards,
    boardById: (state) => (id: number) => state.boards.find(b => b.id === id),
    boardsCount: (state) => state.boards.length,
    hasError: (state) => !!state.error,
  },
  actions: {
    // Подписка на обновление и удаление доски (глобальная, для совместимости)
    async connectBoardRealtime(boardId: number) {
      await subscribe(`/topic/board/${boardId}`, this.onBoardUpdate.bind(this))
      await subscribe(`/topic/board/${boardId}/delete`, this.onBoardDelete.bind(this))
    },
    disconnectBoardRealtime(boardId: number) {
      unsubscribe(`/topic/board/${boardId}`)
      unsubscribe(`/topic/board/${boardId}/delete`)
    },

    // --- Индивидуальные realtime-топики для пользователя ---
    async connectUserBoardRealtime(userId: number) {
      await subscribe(`/topic/user/${userId}/board`, this.onUserBoardUpdate.bind(this))
      await subscribe(`/topic/user/${userId}/board/delete`, this.onUserBoardDelete.bind(this))
    },
    disconnectUserBoardRealtime(userId: number) {
      unsubscribe(`/topic/user/${userId}/board`)
      unsubscribe(`/topic/user/${userId}/board/delete`)
    },
    // Обработчик обновления доски через user topic
    onUserBoardUpdate(msg: any) {
      console.log('[WebSocket] Получено обновление доски через user topic:', msg)
      // Логика идентична onBoardUpdate
      const updated = JSON.parse(msg.body)
      const idx = this.boards.findIndex((b: any) => b.id === updated.id)
      if (idx !== -1) {
        this.boards[idx] = {
          ...this.boards[idx],
          title: updated.name,
          description: updated.description,
          scope: updated.scope,
          owner: updated.owner,
          membersCount: updated.membersCount ?? this.boards[idx].membersCount,
          tasksCount: updated.tasksCount ?? this.boards[idx].tasksCount,
          progress: updated.progress ?? this.boards[idx].progress,
        }
      } else {
        this.boards.push({
          id: updated.id,
          title: updated.name,
          description: updated.description,
          scope: updated.scope,
          owner: updated.owner,
          membersCount: updated.membersCount ?? 0,
          tasksCount: updated.tasksCount ?? 0,
          progress: updated.progress ?? 0,
        })
      }
    },
    // Обработчик удаления доски через user topic
    onUserBoardDelete(msg: any) {
      console.log('[WebSocket] Получено удаление доски через user topic:', msg)
      const deleted = JSON.parse(msg.body)
      this.boards = this.boards.filter((b: any) => b.id !== deleted.id)
      if (this.currentBoardId === deleted.id) {
        this.currentBoardId = null
        if (typeof localStorage !== 'undefined') localStorage.removeItem('currentBoardId')
      }
    },
    // Обработчик обновления доски
    onBoardUpdate(msg: any) {
      const updated = JSON.parse(msg.body)
      const idx = this.boards.findIndex((b: any) => b.id === updated.id)
      if (idx !== -1) {
        this.boards[idx] = {
          ...this.boards[idx],
          title: updated.name,
          description: updated.description,
          scope: updated.scope,
          owner: updated.owner,
          membersCount: updated.membersCount ?? this.boards[idx].membersCount,
          tasksCount: updated.tasksCount ?? this.boards[idx].tasksCount,
          progress: updated.progress ?? this.boards[idx].progress,
        }
      } else {
        // Новая доска — пушим в список
        this.boards.push({
          id: updated.id,
          title: updated.name,
          description: updated.description,
          scope: updated.scope,
          owner: updated.owner,
          membersCount: updated.membersCount ?? 0,
          tasksCount: updated.tasksCount ?? 0,
          progress: updated.progress ?? 0,
        })
      }
    },
    // Обработчик удаления доски
    onBoardDelete(msg: any) {
      const deleted = JSON.parse(msg.body)
      this.boards = this.boards.filter((b: any) => b.id !== deleted.id)
      if (this.currentBoardId === deleted.id) {
        this.currentBoardId = null
        if (typeof localStorage !== 'undefined') localStorage.removeItem('currentBoardId')
      }
    },
    // Установить текущую доску и сохранить в localStorage
    setCurrentBoard(id: number) {
      this.currentBoardId = id
      if (typeof localStorage !== 'undefined') localStorage.setItem('currentBoardId', id.toString())
    },
    async fetchBoards(userId: number, page = 0, size = 1000) {
      if (!userId || isNaN(userId)) {
        console.warn('fetchBoards: userId is not defined or invalid:', userId)
        this.loading = false
        return
      }
      this.loading = true
      try {
        const res = await apiFetch(`${baseUrl}/api/boards?memberIds=${userId}&page=${page}&size=${size}`)
        const data = await res.json()
        this.boards = data.content.map((b: any) => ({
          id: b.id,
          title: b.name,
          description: b.description,
          scope: b.scope,
          owner: b.owner,
          membersCount: b.membersCount ?? 0,
          tasksCount: b.tasksCount ?? 0,
          progress: b.progress ?? 0,
        }))
        // Сброс currentBoardId, если доски нет в списке
        if (this.currentBoardId != null && !this.boards.some(b => b.id === this.currentBoardId)) {
          this.currentBoardId = null
          if (typeof localStorage !== 'undefined') localStorage.removeItem('currentBoardId')
        }
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async createBoard(name: string, description: string = 'Новая доска') {
      try {
        const res = await apiFetch(`${baseUrl}/api/boards`, {
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
        const res = await apiFetch(`${baseUrl}/api/boards/${id}`, {
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
        await apiFetch(`${baseUrl}/api/boards/${id}`, { method: 'DELETE' })
        this.boards = this.boards.filter(b => b.id !== id)
        if (this.currentBoardId === id) {
          this.currentBoardId = null
          if (typeof localStorage !== 'undefined') localStorage.removeItem('currentBoardId')
        }
      } catch (e: any) {
        this.error = e.message
      }
    },
  },
})
