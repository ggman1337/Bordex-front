<script setup lang="ts">
import { ref } from 'vue'
import SockJS from 'sockjs-client'
import webstomp from 'webstomp-client'

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
const messages = ref<ChatMessage[]>([])
const messageText = ref('')

const currentUser = { id: 1, name: 'User' }
const activeContact = { id: 2, name: 'Contact' }

const yourAccessToken = 'ВАШ_JWT_ТОКЕН'

const connect = () => {
  const socket = new SockJS('http://localhost:8080/ws')
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
</script>

<template>
  <div class="chat-container">
    <button @click="connect" class="connect-button">Подключиться</button>

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
</style>
