<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div v-if="!connected" class="bg-white p-8 rounded-lg shadow-md w-80">
      <h2 class="text-2xl font-bold mb-6 text-center">Connect to Board</h2>
      <button @click="connect" class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Connect
      </button>
    </div>

    <div v-else class="flex w-full max-w-4xl h-[600px] bg-white shadow-md rounded-lg overflow-hidden">
      <div class="w-full p-4 flex flex-col">
        <h2 class="text-xl font-bold mb-4">Tasks</h2>
        <ul class="flex-1 overflow-y-auto space-y-2">
          <li v-for="task in tasks" :key="task.id" class="cursor-pointer hover:bg-blue-600 p-2 rounded bg-blue-500 text-white">
            <span>{{ task.name }}</span>
          </li>
        </ul>

        <form @submit.prevent="createTask" class="flex gap-2 mt-4">
          <input v-model="taskName" type="text" placeholder="New Task Name" class="flex-1 border rounded px-3 py-2"/>
          <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Create Task
          </button>
        </form>

        <button @click="logout" class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Disconnect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'

const connected = ref(false)
const tasks = ref([])
const taskName = ref('')
let stompClient = null
const baseUrl = 'http://localhost:8080'

const connect = () => {
  connected.value = true
  const socket = new SockJS(`${baseUrl}/ws`)
  stompClient = Stomp.over(socket)
  stompClient.connect({}, onConnected, onError)
}

const onConnected = () => {
  // Подписываемся на обновления для конкретной доски
  stompClient.subscribe('/topic/board/1', onTaskUpdate);
  stompClient.send('/app/board.join', {}, JSON.stringify({
    boardId: 1,
    userId: 1
  }));
  fetchTasks();
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

const fetchTasks = async () => {
  const response = await fetch(`${baseUrl}/api/boards/1/tasks`)
  tasks.value = await response.json()
}

const createTask = async () => {
  if (taskName.value.trim()) {
    await fetch(`${baseUrl}/api/tasks/1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: taskName.value,
        status: 'NEW',
        priority: 'LOW'
      })
    })

  }
}

const onError = () => {
  alert('Could not connect to WebSocket server. Please refresh this page to try again!')
}

const logout = () => {
  stompClient.send('/app/board.leave', {}, JSON.stringify({ boardId: 1, userId: 1 }))
  connected.value = false
}

onBeforeUnmount(() => {
  if (stompClient) {
    stompClient.disconnect()
  }
})
</script>