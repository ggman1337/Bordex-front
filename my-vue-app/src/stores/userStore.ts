import { defineStore } from 'pinia'
import { websocketConfig } from '@/config/websocket.config'

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

export interface UserState {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  users: User[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: 0,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    users: []
  }),
  getters: {
    getUserById: (state) => (id: number) => state.users.find(u => u.id === id)
  },
  actions: {
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
    },
    async fetchUsers() {
      try {
        const res = await fetch(`${baseUrl}/api/users`)
        const usersData: any[] = await res.json()
        // map API fields to User objects
        this.users = usersData.map((u: any) => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email
        }))
      } catch (e) {
        console.error('Failed to fetch users', e)
      }
    },
    async fetchUsersFromBoard(boardId: number) {
      try {
        const res = await fetch(`${baseUrl}/api/users?boardIds=${boardId}&page=0&size=200`)
        // parse paginated response
        const data: any = await res.json()
        const usersData: any[] = data.content || []
        // map API fields to User objects
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
    }
    
  }
})
