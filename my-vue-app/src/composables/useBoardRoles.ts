import { computed, isRef, ref, type Ref  } from 'vue'
import { useUserStore } from '@/stores/userStore'
import type { BoardRole } from '@/constants/boardRoles'

/**
 * Утилита для проверки ролей пользователя на доске
 * @param boardId - id доски
 */

export function useBoardRoles(boardId: Ref<number> | number) {
  const userStore = useUserStore()
  const idRef = isRef(boardId) ? boardId : ref(boardId)
  const roles = computed(() => userStore.userBoardRoles[idRef.value] || [])

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
