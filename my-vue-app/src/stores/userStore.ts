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

export interface UserState {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  users: User[]
  boardUsers: Record<number, User[]> // boardId -> users
  userBoardRoles: Record<number, BoardRole[]> // boardId -> roles текущего пользователя
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: 1,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    users: [],
    boardUsers: {}, // boardId -> users
    userBoardRoles: {} // boardId -> roles
  }),
  getters: {
    getUserById: (state: UserState) => (id: number) => state.users.find((u: User) => u.id === id)
  },
  actions: {
    /**
     * Получить и сохранить роли пользователя на конкретной доске
     */
    async fetchUserBoardRoles(boardId: number) {
      if (!this.id) return
      const roles = await fetchUserBoardRoles(this.id, boardId)
      this.userBoardRoles[boardId] = roles
    },
    /**
     * Получить все роли пользователя по всем доскам (например, при инициализации)
     */
    async fetchAllUserBoardRoles() {
      if (!this.id) return
      this.userBoardRoles = await fetchAllUserBoardRoles(this.id)
    },
    /**
     * Проверить, есть ли у пользователя роль на доске
     */
    hasBoardRole(boardId: number, role: BoardRole) {
      return this.userBoardRoles[boardId]?.includes(role)
    },
    async fetchCurrentUser() {
      try {
        const res = await fetch(`${baseUrl}/api/users/1`)
        const data: any = await res.json()
        this.id = data.id
        this.username = data.username 
        this.firstName = data.firstName
        this.lastName = data.lastName
        this.email = data.email
      } catch (e) {
        console.error('Failed to fetch current user', e)
      }
      // Подключаем WebSocket после успешного получения пользователя
      connectWebSocket()
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
    logout() {
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
