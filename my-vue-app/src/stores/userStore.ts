import {defineStore} from 'pinia'
import {urlConfig} from '@/config/websocket.config'
import {connectWebSocket, disconnectWebSocket} from '@/lib/websocket'
import type {BoardRole} from '@/constants/boardRoles'
import {fetchAllUserBoardRoles, fetchUserBoardRoles} from '@/api/boardRoles'
import {apiFetch} from '@/api/apiFetch'
import {subscribeBoardRolesRealtimeRaw} from '@/composables/useBoardRolesRealtime'

const baseUrl = urlConfig.restUrl

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
    allowOnSiteNotifications?: boolean
    allowTelegramNotifications?: boolean
    allowEmailNotifications?: boolean
    users: User[]
    boardUsers: Record<number, User[]> // boardId -> users
    userBoardRoles: Record<number, BoardRole[]> // boardId -> roles текущего пользователя
    boardRoles: Record<number, any>
    boards: Array<{ id: number, name: string }>
    userLoaded: boolean
}

export const useUserStore = defineStore('user', {
    state: (): UserState & {
        _rolesUnsubscribers: Record<number, () => void>;
        boardRolesCache: Record<number, any[]>;
    } => ({
        id: 0,
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        allowOnSiteNotifications: false,
        allowTelegramNotifications: false,
        allowEmailNotifications: false,
        users: [],
        boardUsers: {}, // boardId -> users
        userBoardRoles: {}, // boardId -> roles
        boardRoles: {}, // boardId -> roles
        boards: [],
        userLoaded: false,
        _rolesUnsubscribers: {},
        boardRolesCache: {},
    }),
    getters: {
        getUserById: (state: UserState) => (id: number) => state.users.find((u: User) => u.id === id),
        getUserBoardRoles: (state: UserState) => state.userBoardRoles,
    },
    actions: {
        subscribeAllBoardRolesRealtime() {
            if (!this._rolesUnsubscribers || typeof this._rolesUnsubscribers !== 'object') {
                this._rolesUnsubscribers = {}
            }
            Object.values(this._rolesUnsubscribers).forEach(unsub => unsub())
            this._rolesUnsubscribers = {}
            Object.keys(this.userBoardRoles).forEach((boardIdStr) => {
                const boardId = Number(boardIdStr)
                this.subscribeBoardRolesRealtime(boardId)
            })
        }
        ,
        subscribeBoardRolesRealtime(boardId: number) {
            if (this._rolesUnsubscribers[boardId]) {
                this._rolesUnsubscribers[boardId]()
            }
            this._rolesUnsubscribers[boardId] = subscribeBoardRolesRealtimeRaw(
                boardId,
                async (updateBordRole) => {
                    const boardId = updateBordRole.board.id

                    let updatedRoles = this.boardRolesCache[boardId] ?? []

                    const index = updatedRoles.findIndex(r => r.id === updateBordRole.id)

                    if (index !== -1) {
                        updatedRoles.splice(index, 1, updateBordRole)
                    } else {
                        updatedRoles = [...updatedRoles, updateBordRole]
                    }

                    this.boardRolesCache[boardId] = [...updatedRoles]

                    if (updateBordRole.user?.id === this.id) {
                        const roles = updateBordRole.boardRoles ?? []
                        this.userBoardRoles = {
                            ...this.userBoardRoles,
                            [boardId]: [...roles]
                        }
                    }

                },
                async () => {
                }
            )
        }
        ,
        async fetchUserBoardRoles(boardId: number) {
            if (!this.id) return
            const roles = await fetchUserBoardRoles(this.id, boardId)
            this.userBoardRoles = {...this.userBoardRoles, [boardId]: roles}
        }
        ,
        async fetchAllUserBoardRoles() {
            if (!this.id) return
            this.userBoardRoles = await fetchAllUserBoardRoles(this.id)
            this.subscribeAllBoardRolesRealtime()
        }
        ,
        hasBoardRole(boardId: number, role: BoardRole) {
            return this.userBoardRoles[boardId]?.includes(role)
        }
        ,
        async fetchCurrentUser() {
            try {
                const res = await fetch(`${baseUrl}/api/auth/me`, {credentials: 'include'})
                if (!res.ok) throw new Error('Not authenticated')
                const data: any = await res.json()
                this.id = data.id
                this.username = data.username
                this.firstName = data.firstName
                this.lastName = data.lastName
                this.email = data.email
                this.allowOnSiteNotifications = data.allowOnSiteNotifications
                this.allowTelegramNotifications = data.allowTelegramNotifications
                this.allowEmailNotifications = data.allowEmailNotifications
                this.boards = (data.userBoardRoles || []).map((ubr: any) => ubr.board)
                this.userLoaded = true
                connectWebSocket()
            } catch (e) {
                this.id = 0
                this.username = ''
                this.firstName = ''
                this.lastName = ''
                this.email = ''
                this.allowOnSiteNotifications = false
                this.allowTelegramNotifications = false
                this.allowEmailNotifications = false
                this.userBoardRoles = {}
                this.boards = []
                this.userLoaded = true
                console.error('Failed to fetch current user', e)
            } finally {
                this.userLoaded = true;
            }
            connectWebSocket()
        }
        ,
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
        }
        ,
        async fetchUsersFromBoard(boardId: number, force = false) {
            try {
                if (this.boardUsers[boardId] && this.boardUsers[boardId].length > 0 && !force) {
                    return
                }
                const res = await apiFetch(`${baseUrl}/api/users?boardIds=${boardId}&page=0&size=200`)
                const data: any = await res.json()
                const usersRaw = data.content || [];

                let rolesList = this.boardRolesCache[boardId];
                if (!rolesList || force) {
                    const rolesRes = await apiFetch(`${baseUrl}/api/users/boards/roles?boardId=${boardId}&page=0&size=200`)
                    const rolesData: any = await rolesRes.json()
                    rolesList = Array.isArray(rolesData.content) ? rolesData.content : [];
                    this.boardRolesCache[boardId] = rolesList;
                }

                const newUsers = usersRaw.map((u: any) => {
                    const roleEntry = rolesList.find((r: any) => r.user && r.user.id === u.id)
                    return {
                        id: u.id,
                        username: u.username,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        email: u.email,
                        roles: u.roles ? [...u.roles] : [],
                        boardRoles: {
                            [boardId]: roleEntry && Array.isArray(roleEntry.boardRoles) ? [...roleEntry.boardRoles] : []
                        }
                    }
                })
                this.boardUsers[boardId] = newUsers
            } catch (e) {
                console.error('Failed to fetch users or roles', e)
            }
        }
        ,
        async logout() {
            if (!this._rolesUnsubscribers || typeof this._rolesUnsubscribers !== 'object') {
                this._rolesUnsubscribers = {}
            }
            Object.values(this._rolesUnsubscribers).forEach(unsub => unsub())
            this._rolesUnsubscribers = {}
            try {
                await fetch(`${baseUrl}/api/auth/logout`, {method: 'POST', credentials: 'include'})
            } catch (e) {
                // ignore error
            }
            this.id = 0
            this.username = ''
            this.firstName = ''
            this.lastName = ''
            this.email = ''
            disconnectWebSocket()
        }
    }
})
