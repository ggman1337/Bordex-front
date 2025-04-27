import { defineStore } from 'pinia'
import { ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import { websocketConfig } from '@/config/websocket.config'
import type { Task as BoardTask, BoardColumn } from '@/components/boards/types'

const baseUrl = websocketConfig.serverUrl

// Цвета для статусов задач
const statusColors: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
}

export const useTaskStore = defineStore('task', () => {
  const columns = ref<BoardColumn[]>([])
  let stompClient: any

  // Преобразовать сырой объект задачи в формат Task для TaskCard.vue
  function mapTask(t: any): BoardTask {
    return {
      id: t.id,
      title: t.name,
      description: t.description ?? '',
      tag: { label: t.status, color: statusColors[t.status] ?? '' },
      avatars: [],
      assignees: t.assignees ?? [],
      priority: t.priority ?? 'LOW',
    }
  }

  async function fetchTasks(boardId: number) {
    const res = await fetch(`${baseUrl}/api/boards/${boardId}/tasks`)
    const raw: any[] = await res.json()
    const mapped: BoardTask[] = raw.map(mapTask)
    columns.value = [
      { id: 1, title: 'Нужно сделать', tasks: mapped.filter((t: BoardTask) => t.tag.label === 'NEW') },
      { id: 2, title: 'В процессе', tasks: mapped.filter((t: BoardTask) => t.tag.label === 'IN_PROGRESS') },
      { id: 3, title: 'Готово', tasks: mapped.filter((t: BoardTask) => t.tag.label === 'DONE') },
    ]
  }

  function connect(boardId: number) {
    const socket = new SockJS(`${baseUrl}/ws`)
    stompClient = Stomp.over(socket)
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/board/${boardId}/tasks`, onTaskUpdate)
      fetchTasks(boardId)
    })
  }

  function disconnect() {
    if (stompClient) stompClient.disconnect()
  }

  function onTaskUpdate(payload: any) {
    const raw = JSON.parse(payload.body)
    const task = mapTask(raw)
    // удаляем задачу из всех колонок
    columns.value.forEach((col: BoardColumn) => {
      col.tasks = col.tasks.filter((t: BoardTask) => t.id !== task.id)
    })
    // добавляем в нужную колонку
    const newCol = columns.value.find(c => (task.tag.label === 'NEW' ? 1 : task.tag.label === 'IN_PROGRESS' ? 2 : 3) === c.id)
    if (newCol) newCol.tasks.push(task)
  }

  async function createTask(boardId: number, taskData: {
    name: string
    description: string
    status: 'NEW' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }) {
    await fetch(`${baseUrl}/api/tasks/${boardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority
      })
    })
  }

  async function updateTask(taskId: number, taskData: {
    name: string
    description: string
    status: 'NEW' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }) {
    await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority
      })
    })
  }

  return {
    columns,
    fetchTasks,
    connect,
    disconnect,
    createTask,
    updateTask
  }
})
