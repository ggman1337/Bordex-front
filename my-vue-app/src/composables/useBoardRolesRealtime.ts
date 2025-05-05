import { subscribe, unsubscribe } from '@/lib/websocket'

/**
 * Подписка на realtime-обновления ролей на доске.
 * Возвращает функцию для отписки.
 */
export function subscribeBoardRolesRealtimeRaw(
  boardId: number,
  onUpdate: (userBoardRole: any) => void,
  onDelete?: (userBoardRole: any) => void
): () => void {
  const updateTopic = `/topic/board/${boardId}/roles`
  const deleteTopic = `/topic/board/${boardId}/roles/delete`

  function handleUpdate(msg: any) {
    try {
      const data = JSON.parse(msg.body)
      onUpdate(data)
    } catch (e) {
      console.error('[WebSocket][Roles] Failed to parse update', e)
    }
  }

  function handleDelete(msg: any) {
    try {
      const data = JSON.parse(msg.body)
      onDelete && onDelete(data)
    } catch (e) {
      console.error('[WebSocket][Roles] Failed to parse delete', e)
    }
  }

  subscribe(updateTopic, handleUpdate)
  subscribe(deleteTopic, handleDelete)

  // Возвращаем функцию для отписки
  return () => {
    unsubscribe(updateTopic)
    unsubscribe(deleteTopic)
  }
}
