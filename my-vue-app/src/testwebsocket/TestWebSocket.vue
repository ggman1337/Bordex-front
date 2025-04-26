<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import SockJS from 'sockjs-client'
import webstomp from 'webstomp-client'
import { websocketConfig } from '@/config/websocket.config'

// Интерфейс для сообщения чата
interface ChatMessage {
  id?: string
  chatId?: string
  senderId: number
  recipientId: number
  senderName: string
  recipientName: string
  content: string
  timestamp: string
}

const stompClient = ref<any>(null)
const connected = ref(false)
const connecting = ref(false)
const connectionError = ref<string | null>(null)
const messages = ref<ChatMessage[]>([])
const messageText = ref('')

const currentUser = { id: 1, name: 'User' }
const activeContact = { id: 2, name: 'Contact' }

const yourAccessToken = 'ВАШ_JWT_ТОКЕН'

const connect = () => {
  connecting.value = true
  connectionError.value = null
  const socket = new SockJS(websocketConfig.serverUrl)
  // создаем stomp клиент через webstomp.over, опционально можно передать настройки (например, debug)
  stompClient.value = webstomp.over(socket, { debug: false })
  // подключаемся; заголовки можно передавать, например, для аутентификации
  stompClient.value.connect(
      { Authorization: `Bearer ${yourAccessToken}` },
      onConnected,
      onError
  )
}

const onConnected = () => {
  connected.value = true
  connecting.value = false
  connectionError.value = null
  // подписка на приватную очередь текущего пользователя
  stompClient.value.subscribe(
      `/user/${currentUser.id}/queue/messages`,
      (message: any) => {
        if (message.body) {
          const chatMessage: ChatMessage = JSON.parse(message.body)
          messages.value.push(chatMessage)
        }
      }
  )
}

const onError = (error: any) => {
  console.error('STOMP error', error)
  connecting.value = false
  connected.value = false
  connectionError.value = 'Ошибка подключения к серверу'
}

const send = () => {
  if (messageText.value.trim() !== '' && stompClient.value) {
    const message: ChatMessage = {
      senderId: currentUser.id,
      recipientId: activeContact.id,
      senderName: currentUser.name,
      recipientName: activeContact.name,
      content: messageText.value,
      timestamp: new Date().toISOString()
    }
    stompClient.value.send(
        '/app/chat',
        JSON.stringify(message),
        {} // дополнительные заголовки, если нужны
    )
    messageText.value = ''
  }
}

const disconnect = () => {
  if (stompClient.value && connected.value) {
    stompClient.value.disconnect()
    connected.value = false
    connecting.value = false
    connectionError.value = null
    console.log('WebSocket соединение закрыто')
  }
}

// Отключаемся при удалении компонента
onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="chat-container">
    <div class="connection-status">
      <button 
        @click="connect" 
        :disabled="connecting"
        class="connect-button"
      >
        {{ connecting ? 'Подключение...' : (connected ? 'Переподключиться' : 'Подключиться') }}
      </button>
      
      <div class="status-indicator" :class="{ 
        'status-connected': connected,
        'status-connecting': connecting,
        'status-error': connectionError
      }">
        <span v-if="connected" class="status-text">Подключено</span>
        <span v-else-if="connecting" class="status-text">Подключение...</span>
        <span v-else-if="connectionError" class="status-text error">{{ connectionError }}</span>
        <span v-else class="status-text">Отключено</span>
      </div>
    </div>

    <div v-if="connected" class="chat-box">
      <div class="messages">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <strong>{{ msg.senderName }}:</strong> {{ msg.content }}
        </div>
      </div>

      <div class="input-area">
        <input
            v-model="messageText"
            type="text"
            placeholder="Введите сообщение"
            class="message-input"
            @keyup.enter="send"
        />
        <button @click="send" class="send-button">Отправить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.connect-button,
.send-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  margin-bottom: 10px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
}

.chat-box {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin-top: 20px;
}

.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  padding: 5px 10px;
  background-color: #f1f1f1;
  margin-bottom: 5px;
  border-radius: 4px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.status-connected {
  background-color: #22c55e;
  color: white;
}

.status-connecting {
  background-color: #f59e0b;
  color: white;
}

.status-error {
  background-color: #ef4444;
  color: white;
}

.status-text {
  font-weight: 500;
}

.status-text.error {
  color: white;
}

.connect-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
