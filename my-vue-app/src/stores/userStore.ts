import { defineStore } from 'pinia'
import { websocketConfig } from '@/config/websocket.config'
import { connectWebSocket, disconnectWebSocket } from '@/lib/websocket'

// derive REST base URL from WS config
const baseUrl = websocketConfig.serverUrl.replace(/\/ws$/, '')

// user model reflects backend fields
export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  roles?: string[]
}

import type { BoardRole } from '@/constants/boardRoles'
import { fetchUserBoardRoles, fetchAllUserBoardRoles } from '@/api/boardRoles'
import { subscribeBoardRolesRealtimeRaw } from '@/composables/useBoardRolesRealtime'

export interface UserState {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  users: User[]
  boardUsers: Record<number, User[]> // boardId -> users
  userBoardRoles: Record<number, BoardRole[]> // boardId -> roles текущего пользователя
  boards: Array<{ id: number, name: string }>
  userLoaded: boolean // был ли загружен пользователь
}

export const useUserStore = defineStore('user', {
  state: (): UserState & { _rolesUnsubscribers: Record<number, () => void> } => ({
    id: 0,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    users: [],
    boardUsers: {}, // boardId -> users
    userBoardRoles: {}, // boardId -> roles
    boards: [],
    userLoaded: false, // был ли загружен пользователь
    _rolesUnsubscribers: {}
  }),
  getters: {
    getUserById: (state: UserState) => (id: number) => state.users.find((u: User) => u.id === id)
  },
  actions: {
    /**
     * Подписаться на realtime-обновления ролей пользователя на всех досках через WebSocket
     */
    subscribeAllBoardRolesRealtime() {
      // Гарантируем, что _rolesUnsubscribers всегда объект
      if (!this._rolesUnsubscribers || typeof this._rolesUnsubscribers !== 'object') {
        this._rolesUnsubscribers = {}
      }
      // Отписываемся от всех предыдущих
      Object.values(this._rolesUnsubscribers).forEach(unsub => unsub())
      this._rolesUnsubscribers = {}
      // Для всех известных досок (userBoardRoles)
      Object.keys(this.userBoardRoles).forEach((boardIdStr) => {
        const boardId = Number(boardIdStr)
        this.subscribeBoardRolesRealtime(boardId)
      })
    },
    /**
     * Подписаться на realtime-обновления ролей пользователя на доске через WebSocket
     */
    subscribeBoardRolesRealtime(boardId: number) {
      // Если уже подписаны — отписаться
      if (this._rolesUnsubscribers[boardId]) {
        this._rolesUnsubscribers[boardId]()
      }
      // Подписываемся и сохраняем отписчик
      this._rolesUnsubscribers[boardId] = subscribeBoardRolesRealtimeRaw(
        boardId,
        async () => {
          await this.fetchUserBoardRoles(boardId)
          await this.fetchUsersFromBoard(boardId) // <-- обновляем список пользователей после изменения ролей
        },
        async () => {
          await this.fetchUserBoardRoles(boardId)
        }
      )
    },
    /**
     * Получить и сохранить роли пользователя на конкретной доске
     */
    async fetchUserBoardRoles(boardId: number) {
      if (!this.id) return
      const roles = await fetchUserBoardRoles(this.id, boardId)
      // Гарантируем реактивность для Pinia/Vue
      this.userBoardRoles = { ...this.userBoardRoles, [boardId]: roles }
    },
    /**
     * Получить все роли пользователя по всем доскам (например, при инициализации)
     */
    async fetchAllUserBoardRoles() {
      if (!this.id) return
      this.userBoardRoles = await fetchAllUserBoardRoles(this.id)
      this.subscribeAllBoardRolesRealtime()
    },
    /**
     * Проверить, есть ли у пользователя роль на доске
     */
    hasBoardRole(boardId: number, role: BoardRole) {
      return this.userBoardRoles[boardId]?.includes(role)
    },
    async fetchCurrentUser() {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`, { credentials: 'include' })
        if (!res.ok) throw new Error('Not authenticated')
        const data: any = await res.json()
        this.id = data.id
        this.username = data.username 
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.email = data.email
        this.boards = (data.userBoardRoles || []).map((ubr: any) => ubr.board)
      } catch (e) {
        // Только сбрасываем локальные данные пользователя, но НЕ вызываем logout и не делаем запрос на сервер
        this.id = 0
        this.username = ''
        this.firstName = ''
        this.lastName = ''
        this.email = ''
        console.error('Failed to fetch current user', e)
      } finally {
        this.userLoaded = true;
      }
      // Подключаем WebSocket после успешного получения пользователя
      connectWebSocket()
      // После успешного получения пользователя пробуем подписаться на все роли (если id есть)
      if (this.id) {
        await this.fetchAllUserBoardRoles()
      }
    },
    async fetchUsers() {
      try {
        const res = await fetch(`${baseUrl}/api/users`)
        const data: any = await res.json()
        const usersData: any[] = Array.isArray(data.content) ? data.content : []
        this.users = usersData.map((u: any) => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          roles: u.roles || []
        }))
      } catch (e) {
        console.error('Failed to fetch users', e)
      }
    },
    async fetchUsersFromBoard(boardId: number) {
      try {
        const res = await fetch(`${baseUrl}/api/users?boardIds=${boardId}&page=0&size=200`)
        const data: any = await res.json()
        this.boardUsers[boardId] = (data.content || []).map((u: any) => {
          // Собираем boardRoles в объект user.boardRoles[boardId]
          let boardRolesMap: Record<number, string[]> = {}
          if (Array.isArray(u.userBoardRoles)) {
            for (const entry of u.userBoardRoles) {
              if (entry.board && entry.board.id && Array.isArray(entry.boardRoles)) {
                boardRolesMap[entry.board.id] = entry.boardRoles
              }
            }
          }
          return {
            id: u.id,
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            roles: u.roles || [],
            boardRoles: boardRolesMap
          }
        })
      } catch (e) {
        console.error('Failed to fetch users', e)
      }
    },
    async logout() {
      // Гарантируем, что _rolesUnsubscribers всегда объект
      if (!this._rolesUnsubscribers || typeof this._rolesUnsubscribers !== 'object') {
        this._rolesUnsubscribers = {}
      }
      // Отписаться от всех realtime-ролей
      Object.values(this._rolesUnsubscribers).forEach(unsub => unsub())
      this._rolesUnsubscribers = {}
      // Запрос на сервер для очистки куки
      try {
        await fetch('http://localhost:8080/api/auth/logout', { method: 'POST' , credentials: 'include' })
      } catch (e) {
        // ignore error
      }
      // Очистить данные пользователя
      this.id = 0
      this.username = ''
      this.firstName = ''
      this.lastName = ''
      this.email = ''
      // Отключить WebSocket
      disconnectWebSocket()
    }
  }
})
