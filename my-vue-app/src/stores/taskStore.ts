import { defineStore } from 'pinia'
import { ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import { websocketConfig } from '@/config/websocket.config'
import type { Task as BoardTask, BoardColumn } from '@/components/boards/types'

const baseUrl = websocketConfig.serverUrl

// removed statusColors – tags now use backend-provided tagColor

export const useTaskStore = defineStore('task', () => {
  const columns = ref<BoardColumn[]>([])
  let stompClient: any

  // Преобразовать сырой объект задачи в формат Task для TaskCard.vue
  function mapTask(t: any): BoardTask {
    return {
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      status: t.status as 'NEW' | 'IN_PROGRESS' | 'DONE',
      tag: { value: t.tag, label: t.tag, color: t.tagColor ?? '' },
      assignees: t.assignees ?? [],
      priority: t.priority ?? 'LOW',
      deadline: t.deadline ?? null,
    }
  }

  async function fetchTasks(boardId: number, page = 0, size = 200) {
    const res = await fetch(`${baseUrl}/api/tasks?boardId=${boardId}&page=${page}&size=${size}`)
    const data: any = await res.json()
    const raw: any[] = Array.isArray(data) ? data : data.content || []
    const mapped: BoardTask[] = raw.map(mapTask)
    columns.value = [
      { id: 1, title: 'Нужно сделать', tasks: mapped.filter((t: BoardTask) => t.status === 'NEW') },
      { id: 2, title: 'В процессе', tasks: mapped.filter((t: BoardTask) => t.status === 'IN_PROGRESS') },
      { id: 3, title: 'Готово', tasks: mapped.filter((t: BoardTask) => t.status === 'DONE') },
    ]
  }

  function connect(boardId: number) {
    const socket = new SockJS(`${baseUrl}/ws`)
    stompClient = Stomp.over(socket)
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/board/${boardId}/tasks`, onTaskUpdate)
      // удаление задач через STOMP
      stompClient.subscribe(`/topic/board/${boardId}/tasks/delete`, (payload: any) => {
        const raw = JSON.parse(payload.body)
        const task = mapTask(raw)
        columns.value.forEach(col => {
          col.tasks = col.tasks.filter(t => t.id !== task.id)
        })
      })
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
    const newCol = columns.value.find(c => (task.status === 'NEW' ? 1 : task.status === 'IN_PROGRESS' ? 2 : 3) === c.id)
    if (newCol) newCol.tasks.push(task)
  }

  async function createTask(boardId: number, taskData: {
    name: string
    description: string
    status: 'NEW' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    tag: string
    deadline?: string | null
  }) {
    await fetch(`${baseUrl}/api/tasks/${boardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        tag: taskData.tag,
        deadline: taskData.deadline ?? null,
      })
    })
    // refresh task list
    fetchTasks(boardId)
  }

  async function updateTask(
    taskId: number,
    taskData: Partial<{
      name: string
      description: string
      status: 'NEW' | 'IN_PROGRESS' | 'DONE'
      priority: 'LOW' | 'MEDIUM' | 'HIGH'
      tag: string
      deadline?: string | null
    }>
  ) {
    await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
  }

  // удаление задачи
  async function deleteTask(boardId: number, taskId: number) {
    await fetch(`${baseUrl}/api/tasks/${taskId}`, { method: 'DELETE' })
    // обновить список задач
    fetchTasks(boardId)
  }

  // назначить пользователя к задаче
  async function assignUser(taskId: number, userId: number) {
    await fetch(`${baseUrl}/api/tasks/${taskId}/assign-user/${userId}`, { method: 'PATCH' })
  }

  // отменить назначение пользователя к задаче
  async function unassignUser(taskId: number, userId: number) {
    await fetch(`${baseUrl}/api/tasks/${taskId}/unassign-user/${userId}`, { method: 'PATCH' })
  }

  return {
    columns,
    fetchTasks,
    connect,
    disconnect,
    createTask,
    updateTask,
    deleteTask,
    assignUser,
    unassignUser
  }
})
