import {defineStore} from 'pinia'
import {urlConfig} from '@/config/websocket.config'
import {connectWebSocket, disconnectWebSocket} from '@/lib/websocket'
import type {BoardRole} from '@/constants/boardRoles'
import {fetchAllUserBoardRoles, fetchUserBoardRoles} from '@/api/boardRoles'
import {apiFetch} from '@/api/apiFetch'
import {subscribeBoardRolesRealtimeRaw} from '@/composables/useBoardRolesRealtime'

// derive REST base URL from WS config
const baseUrl = urlConfig.restUrl

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
    allowOnSiteNotifications?: boolean
    allowTelegramNotifications?: boolean
    allowEmailNotifications?: boolean
    users: User[]
    boardUsers: Record<number, User[]> // boardId -> users
    userBoardRoles: Record<number, BoardRole[]> // boardId -> roles текущего пользователя
    boardRoles: Record<number, any>
    boards: Array<{ id: number, name: string }>
    userLoaded: boolean // был ли загружен пользователь
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
        userLoaded: false, // был ли загружен пользователь
        _rolesUnsubscribers: {},
        boardRolesCache: {}, // ← обычное поле, Pinia сделает его реактивным
    }),
    getters: {
        getUserById: (state: UserState) => (id: number) => state.users.find((u: User) => u.id === id),
        getUserBoardRoles: (state: UserState) => state.userBoardRoles,
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
        }
        ,
        /**
         * Подписаться на realtime-обновления ролей пользователя на доске через WebSocket
         */
        subscribeBoardRolesRealtime(boardId
                                    :
                                    number
        ) {
            // Если уже подписаны — отписаться
            if (this._rolesUnsubscribers[boardId]) {
                this._rolesUnsubscribers[boardId]()
            }
            // Подписываемся и сохраняем отписчик
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
        /**
         * Получить и сохранить роли пользователя на конкретной доске
         */
        async fetchUserBoardRoles(boardId: number) {
            if (!this.id) return
            const roles = await fetchUserBoardRoles(this.id, boardId)
            // Гарантируем реактивность для Pinia/Vue
            this.userBoardRoles = {...this.userBoardRoles, [boardId]: roles}
        }
        ,
        /**
         * Получить все роли пользователя по всем доскам (например, при инициализации)
         */
        async fetchAllUserBoardRoles() {
            if (!this.id) return
            this.userBoardRoles = await fetchAllUserBoardRoles(this.id)
            this.subscribeAllBoardRolesRealtime()
        }
        ,
        /**
         * Проверить, есть ли у пользователя роль на доске
         */
        hasBoardRole(boardId
                     :
                     number, role
                     :
                     BoardRole
        ) {
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
                // Подключаем WebSocket после успешного получения пользователя
                connectWebSocket()
            } catch (e) {
                // Сброс всех пользовательских данных при неавторизованности
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
            // Подключаем WebSocket после успешного получения пользователя
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
                // Если уже есть пользователи для этой доски и не force — не делаем запрос
                if (this.boardUsers[boardId] && this.boardUsers[boardId].length > 0 && !force) {
                    return
                }
                // 1. Получаем пользователей доски
                const res = await apiFetch(`${baseUrl}/api/users?boardIds=${boardId}&page=0&size=200`)
                const data: any = await res.json()
                const usersRaw = data.content || [];

                // 2. Получаем (или используем из кэша) роли пользователей на доске
                let rolesList = this.boardRolesCache[boardId];
                // Если force=true, всегда сбрасываем кэш и делаем новый запрос
                if (!rolesList || force) {
                    const rolesRes = await apiFetch(`${baseUrl}/api/users/boards/roles?boardId=${boardId}&page=0&size=200`)
                    const rolesData: any = await rolesRes.json()
                    rolesList = Array.isArray(rolesData.content) ? rolesData.content : [];
                    this.boardRolesCache[boardId] = rolesList;
                }

                // 3. Мержим роли в объекты пользователей
                const newUsers = usersRaw.map((u: any) => {
                    const roleEntry = rolesList.find((r: any) => r.user && r.user.id === u.id)
                    // Создаем всегда новый объект пользователя (новая ссылка)
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
            // Гарантируем, что _rolesUnsubscribers всегда объект
            if (!this._rolesUnsubscribers || typeof this._rolesUnsubscribers !== 'object') {
                this._rolesUnsubscribers = {}
            }
            // Отписаться от всех realtime-ролей
            Object.values(this._rolesUnsubscribers).forEach(unsub => unsub())
            this._rolesUnsubscribers = {}
            // Запрос на сервер для очистки куки
            try {
                await fetch('http://localhost:8080/api/auth/logout', {method: 'POST', credentials: 'include'})
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
