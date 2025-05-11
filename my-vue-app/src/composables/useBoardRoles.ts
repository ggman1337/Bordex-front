import {computed, isRef, ref, type Ref} from 'vue'
import {useUserStore} from '@/stores/userStore'
import type {BoardRole} from '@/constants/boardRoles'

/**
 * Утилита для проверки ролей пользователя на доске
 * @param boardId - id доски
 */

export function useBoardRoles(boardId: Ref<number> | number) {
    const userStore = useUserStore()
    const idRef = isRef(boardId) ? boardId : ref(boardId)
    const roles = computed(() => userStore.userBoardRoles[idRef.value] || [])

    console.log("roles", roles)

    function hasRole(role: BoardRole) {
        console.log("role", role)
        console.log("roles.value.includes(role)", roles.value.includes(role))
        return roles.value.includes(role)
    }

    function hasAnyRole(...checkRoles: BoardRole[]) {
        console.log("checkRoles", checkRoles)
        console.log("checkRoles.some(r => roles.value.includes(r))", checkRoles.some(r => roles.value.includes(r)))
        return checkRoles.some(r => roles.value.includes(r))
    }

    return {
        roles,
        hasRole,
        hasAnyRole
    }
}
