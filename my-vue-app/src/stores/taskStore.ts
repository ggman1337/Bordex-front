import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscribe, unsubscribe } from '@/lib/websocket'
import type { Task as BoardTask, BoardColumn } from '@/components/boards/types'
import { Status } from '@/components/boards/types'
import { useUserStore } from '@/stores/userStore'
import { apiFetch } from '@/api/apiFetch'
import { urlConfig } from '@/config/websocket.config'

const baseUrl = urlConfig.restUrl

export const useTaskStore = defineStore('task', () => {
  const columns = ref<BoardColumn[]>([])
  const userTasks = ref<BoardTask[]>([])
  const userStore = useUserStore()

  function mapTask(t: any): BoardTask {
    return {
      id: t.id,
      boardId: t.board.id,
      name: t.name,
      description: t.description ?? '',
      status: t.status as Status,
      tag: { value: t.tag, label: t.tag, color: t.tagColor ?? '' },
      assignees: t.assignees ?? [],
      priority: t.priority ?? 'LOW',
      deadline: t.deadline ?? null,
      progress: typeof t.progress === 'number' ? t.progress : 0,
    }
  }

  async function fetchTasks(boardId: number, page = 0, size = 200) {
    const res = await apiFetch(`${baseUrl}/api/tasks?boardId=${boardId}&page=${page}&size=${size}`)
    const data: any = await res.json()
    const raw: any[] = Array.isArray(data) ? data : data.content || []
    const mapped: BoardTask[] = raw.map(mapTask)
    // Распределяем задачи по колонкам, если колонки заданы
    if (columns.value.length) {
      columns.value = columns.value.map(col => ({
        ...col,
        tasks: mapped
          .filter(t => t.status === col.status)
          .sort((a, b) => a.id - b.id),
      }))
    }
  }

  // Оптимистичное обновление статуса задачи локально
  function optimisticUpdateTaskStatus(taskId: number, newStatus: Status) {
    let movedTask: BoardTask | undefined;
    for (const col of columns.value) {
      const idx = col.tasks.findIndex(t => t.id === taskId)
      if (idx !== -1) {
        movedTask = { ...col.tasks[idx], status: newStatus };
        col.tasks.splice(idx, 1);
        break;
      }
    }
    if (movedTask) {
      const targetCol = columns.value.find(c => c.status === newStatus);
      if (targetCol) {
        targetCol.tasks.push(movedTask);
        targetCol.tasks.sort((a, b) => a.id - b.id);
      }
    }
  }

  async function fetchTasksForUser(userId: number, page = 0, size = 200) {
    const res = await apiFetch(`${baseUrl}/api/tasks?assigneeIds=${userId}&page=${page}&size=${size}`)
    const data: any = await res.json()
    const raw: any[] = Array.isArray(data) ? data : data.content || []
    userTasks.value = raw.map(mapTask)
  }

  async function connect(boardId: number) {
    await subscribe(`/topic/board/${boardId}/tasks`, onTaskUpdate)
    await subscribe(`/topic/board/${boardId}/tasks/delete`, (payload: any) => {
      const raw = JSON.parse(payload.body)
      const task = mapTask(raw)
      columns.value.forEach(col => {
        col.tasks = col.tasks.filter(t => t.id !== task.id)
      })
    })
    fetchTasks(boardId)
  }

  function disconnect(boardId?: number) {
    if (boardId) {
      unsubscribe(`/topic/board/${boardId}/tasks`)
      unsubscribe(`/topic/board/${boardId}/tasks/delete`)
    }
  }

  function onTaskUpdate(payload: any) {
    const raw = JSON.parse(payload.body)
    const task = mapTask(raw)
    // Удаляем задачу из всех колонок
    columns.value.forEach((col: BoardColumn) => {
      col.tasks = col.tasks.filter((t: BoardTask) => t.id !== task.id)
    })
    // Вставляем/обновляем задачу в колонке по статусу
    const targetCol = columns.value.find(c => c.status === task.status)
    if (targetCol) {
      targetCol.tasks.push(task)
      targetCol.tasks.sort((a, b) => a.id - b.id)
    }
  }

  async function createTask(boardId: number, taskData: {
    name: string
    description: string
    status: Status
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    tag: string
    deadline?: string | null
    progress?: number
  }) {
    await apiFetch(`${baseUrl}/api/tasks/${boardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: taskData.name,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        tag: taskData.tag,
        deadline: taskData.deadline ?? null,
        progress: taskData.progress ?? 0,
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
      status: Status
      priority: 'LOW' | 'MEDIUM' | 'HIGH'
      tag: string
      deadline?: string | null
      progress?: number
    }>
  ) {
    await apiFetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
  }

  // удаление задачи
  async function deleteTask(boardId: number, taskId: number) {
    await apiFetch(`${baseUrl}/api/tasks/${taskId}`, { method: 'DELETE' })
    // обновить список задач
    fetchTasks(boardId)
  }

  // назначить пользователя к задаче
  async function assignUser(taskId: number, userId: number) {
    await apiFetch(`${baseUrl}/api/tasks/${taskId}/assign-user/${userId}`, { method: 'PATCH' })
  }

  // отменить назначение пользователя к задаче
  async function unassignUser(taskId: number, userId: number) {
    await apiFetch(`${baseUrl}/api/tasks/${taskId}/unassign-user/${userId}`, { method: 'PATCH' })
  }

  // Вебсокет для MyTasksPage
  async function connectUserTasks(userId: number) {
    await subscribe(`/topic/users/${userId}/tasks`, onUserTaskUpdate)
    await subscribe(`/topic/users/${userId}/tasks/delete`, onUserTaskDelete)
  }

  function disconnectUserTasks(userId?: number) {
    if (userId) {
      unsubscribe(`/topic/users/${userId}/tasks`)
      unsubscribe(`/topic/users/${userId}/tasks/delete`)
    }
  }

  function onUserTaskUpdate(payload: any) {
    const raw = JSON.parse(payload.body)
    const updatedTask = mapTask(raw)
    const idx = userTasks.value.findIndex(t => t.id === updatedTask.id)
    // Проверяем, назначен ли пользователь на задачу
    const assignees = updatedTask.assignees || []
    const isAssigned = assignees.some((u: any) => u.id === userStore.id)
    if (!isAssigned && idx !== -1) {
      userTasks.value.splice(idx, 1)
    } else if (isAssigned && idx !== -1) {
      userTasks.value[idx] = updatedTask
    } else if (isAssigned && idx === -1) {
      userTasks.value.push(updatedTask)
    }
  }

  function onUserTaskDelete(payload: any) {
    const raw = JSON.parse(payload.body)
    const taskId = raw.id
    const idx = userTasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) {
      userTasks.value.splice(idx, 1)
    }
  }

  // Allows syncing columns from backend
  function setColumns(newCols: BoardColumn[]) {
    const oldCols = columns.value
    columns.value = newCols.map(col => ({
      ...col,
      tasks: oldCols.find(c => c.id === col.id)?.tasks || []
    }))
  }

  return {
    columns,
    userTasks,
    mapTask,
    fetchTasks,
    optimisticUpdateTaskStatus,
    fetchTasksForUser,
    connect,
    disconnect,
    onTaskUpdate,
    createTask,
    updateTask,
    deleteTask,
    assignUser,
    unassignUser,
    setColumns,
    connectUserTasks,
    disconnectUserTasks,
    onUserTaskUpdate,
    onUserTaskDelete
  }
})
