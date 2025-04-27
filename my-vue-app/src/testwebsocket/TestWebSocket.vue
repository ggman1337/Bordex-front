<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div v-if="!connected" class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Boards</h2>

      <div v-if="boards.length" class="space-y-2 mb-6">
        <div
            v-for="board in boards"
            :key="board.id"
            @click="selectBoard(board.id)"
            class="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer text-center"
        >
          {{ board.name }}
        </div>
      </div>

      <form @submit.prevent="createBoard" class="flex gap-2 mb-4">
        <input v-model="newBoardName" type="text" placeholder="New Board Name" class="flex-1 border rounded px-3 py-2"/>
        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          Create
        </button>
      </form>
    </div>

    <div v-else class="flex w-full max-w-4xl h-[600px] bg-white shadow-md rounded-lg overflow-hidden">
      <div class="w-full p-4 flex flex-col">
        <h2 class="text-xl font-bold mb-4">Tasks (Board {{ selectedBoardId }})</h2>

        <ul class="flex-1 overflow-y-auto space-y-2">
          <li
              v-for="task in tasks"
              :key="task.id"
              class="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded flex flex-col gap-2"
          >
            <div v-if="editedTaskId !== task.id" class="flex justify-between items-center">
              <div @click="startEditing(task)" class="flex-1 cursor-pointer">
                <div><strong>Name:</strong> {{ task.name }}</div>
                <div><strong>Status:</strong> {{ task.status }}</div>
                <div><strong>Priority:</strong> {{ task.priority }}</div>
              </div>
              <button @click.stop="startEditing(task)" class="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                Edit
              </button>
            </div>

            <div v-else class="flex flex-col gap-2">
              <input v-model="editedTaskName" type="text" placeholder="Task Name" class="border rounded px-3 py-2 text-black"/>
              <select v-model="editedTaskStatus" class="border rounded px-3 py-2 text-black">
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <select v-model="editedTaskPriority" class="border rounded px-3 py-2 text-black">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
              <div class="flex gap-2">
                <button @click="saveEditedTask(task)" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                  Save
                </button>
                <button @click="cancelEditing" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">
                  Cancel
                </button>
              </div>
            </div>
          </li>
        </ul>

        <form @submit.prevent="createOrUpdateTask" class="flex gap-2 mt-4">
          <input v-model="taskName" type="text" placeholder="Task Name" class="flex-1 border rounded px-3 py-2"/>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            {{ editingTaskId ? 'Update' : 'Create' }}
          </button>
        </form>

        <button @click="disconnect" class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Disconnect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'

const connected = ref(false)
const boards = ref([])
const tasks = ref([])
const taskName = ref('')
const editingTaskId = ref(null)
const newBoardName = ref('')
const selectedBoardId = ref(null)

const editedTaskId = ref(null)
const editedTaskName = ref('')
const editedTaskStatus = ref('NEW')
const editedTaskPriority = ref('MEDIUM')

let stompClient = null
const baseUrl = "http://localhost:8080"

const loadBoards = async () => {
  const response = await fetch(`${baseUrl}/api/boards?page=0&size=1000`)
  const data = await response.json()
  boards.value = data.content
}

const connectToWebSocket = () => {
  const socket = new SockJS(`${baseUrl}/ws`)
  stompClient = Stomp.over(socket)
  stompClient.connect({}, onConnected, onError)
}

const onConnected = () => {
  stompClient.subscribe(`/topic/board/${selectedBoardId.value}/tasks`, onTaskUpdate)
  fetchTasks()
}

const fetchTasks = async () => {
  const response = await fetch(`${baseUrl}/api/boards/${selectedBoardId.value}/tasks`)
  tasks.value = await response.json()
}

const onTaskUpdate = (payload) => {
  const updatedTask = JSON.parse(payload.body)
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
  } else {
    tasks.value.push(updatedTask)
  }
}

const selectBoard = (boardId) => {
  selectedBoardId.value = boardId
  connected.value = true
  connectToWebSocket()
}

const createBoard = async () => {
  if (!newBoardName.value.trim()) return

  const response = await fetch(`${baseUrl}/api/boards`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: newBoardName.value,
      description: 'New Board',
      scope: 'PRIVATE'
    })
  })

  const board = await response.json()
  boards.value.push(board)
  selectBoard(board.id)
}

const createOrUpdateTask = async () => {
  if (!taskName.value.trim()) return

  if (editingTaskId.value) {
    await fetch(`${baseUrl}/api/tasks/${editingTaskId.value}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: editingTaskId.value,
        name: taskName.value
      })
    })
    editingTaskId.value = null
  } else {
    await fetch(`${baseUrl}/api/tasks/${selectedBoardId.value}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: taskName.value,
        status: 'NEW',
        priority: 'MEDIUM'
      })
    })
  }

  taskName.value = ''
}

const startEditing = (task) => {
  editedTaskId.value = task.id
  editedTaskName.value = task.name
  editedTaskStatus.value = task.status
  editedTaskPriority.value = task.priority
}

const cancelEditing = () => {
  editedTaskId.value = null
  editedTaskName.value = ''
  editedTaskStatus.value = 'NEW'
  editedTaskPriority.value = 'MEDIUM'
}

const saveEditedTask = async (task) => {
  await fetch(`${baseUrl}/api/tasks/${task.id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: editedTaskName.value,
      status: editedTaskStatus.value,
      priority: editedTaskPriority.value
    })
  })
  editedTaskId.value = null
  editedTaskName.value = ''
  editedTaskStatus.value = 'NEW'
  editedTaskPriority.value = 'MEDIUM'
}

const disconnect = () => {
  if (stompClient) {
    stompClient.disconnect()
  }
  connected.value = false
  selectedBoardId.value = null
  tasks.value = []
}

const onError = () => {
  alert('Could not connect to WebSocket server. Please refresh this page to try again!')
}

onMounted(() => {
  loadBoards()
})

onBeforeUnmount(() => {
  if (stompClient) {
    stompClient.disconnect()
  }
})
</script>
