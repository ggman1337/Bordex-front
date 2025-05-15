import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscribe, unsubscribe } from '@/lib/websocket'
import type { Task as BoardTask, BoardColumn } from '@/components/boards/types'
import { Status } from '@/components/boards/types'
import { useUserStore } from '@/stores/userStore'
import { apiFetch } from '@/api/apiFetch'
import { urlConfig } from '@/config/websocket.config'

const baseUrl = urlConfig.restUrl

// removed statusColors – tags now use backend-provided tagColor

export const useTaskStore = defineStore('task', () => {
  // Initialize columns with all statuses to avoid UI flicker
  const columns = ref<BoardColumn[]>([
    { id: 1, title: 'Нужно сделать', status: Status.NEW, tasks: [] },
    { id: 2, title: 'В процессе', status: Status.IN_PROGRESS, tasks: [] },
    { id: 3, title: 'На рассмотрении', status: Status.REVIEW, tasks: [] },
    { id: 4, title: 'Готово', status: Status.DONE, tasks: [] },
  ])
  const userTasks = ref<BoardTask[]>([])
  const userStore = useUserStore()

  // Преобразовать сырой объект задачи в формат Task для TaskCard.vue
  function mapTask(t: any): BoardTask {
    return {
      id: t.id,
      // assign boardId from nested board object
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
    columns.value = [
      { id: 1, title: 'Нужно сделать', status: Status.NEW, tasks: mapped.filter(t => t.status === Status.NEW).sort((a, b) => a.id - b.id) },
      { id: 2, title: 'В процессе', status: Status.IN_PROGRESS, tasks: mapped.filter(t => t.status === Status.IN_PROGRESS).sort((a, b) => a.id - b.id) },
      { id: 3, title: 'На рассмотрении', status: Status.REVIEW, tasks: mapped.filter(t => t.status === Status.REVIEW).sort((a, b) => a.id - b.id) },
      { id: 4, title: 'Готово', status: Status.DONE, tasks: mapped.filter(t => t.status === Status.DONE).sort((a, b) => a.id - b.id) },
    ]
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
      let targetCol;
      if (newStatus === Status.NEW) targetCol = columns.value[0];
      else if (newStatus === Status.IN_PROGRESS) targetCol = columns.value[1];
      else if (newStatus === Status.REVIEW) targetCol = columns.value[2];
      else if (newStatus === Status.DONE) targetCol = columns.value[3];
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

  // --- Вебсокет для MyTasksPage ---
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

  return {
    columns,
    userTasks,
    optimisticUpdateTaskStatus,
    fetchTasks,
    fetchTasksForUser,
    connect,
    disconnect,
    createTask,
    updateTask,
    deleteTask,
    assignUser,
    unassignUser,
    connectUserTasks,
    disconnectUserTasks
  }
})
