import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type { BoardRole } from '@/constants/boardRoles'

/**
 * Утилита для проверки ролей пользователя на доске
 * @param boardId - id доски
 */
export function useBoardRoles(boardId: number) {
  const userStore = useUserStore()
  const roles = computed(() => userStore.userBoardRoles[boardId] || [])

  function hasRole(role: BoardRole) {
    return roles.value.includes(role)
  }

  function hasAnyRole(...checkRoles: BoardRole[]) {
    return checkRoles.some(r => roles.value.includes(r))
  }

  return {
    roles,
    hasRole,
    hasAnyRole
  }
}
