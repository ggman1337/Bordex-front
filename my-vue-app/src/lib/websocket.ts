import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import { urlConfig } from '@/config/websocket.config'

let stompClient: any = null
let isConnected = false
let subscriptions: Record<string, any> = {}
let connectPromise: Promise<void> | null = null

export function connectWebSocket(token?: string): Promise<void> {
  if (isConnected && stompClient) return Promise.resolve()
  if (connectPromise) return connectPromise
  let url = urlConfig.wsUrl.replace(/\/$/, '') + '/ws'
  if (token) {
    url += `?token=${token}`
  }
  connectPromise = new Promise((resolve, reject) => {
    const socket = new SockJS(url)
    stompClient = Stomp.over(socket)
    stompClient.connect({ 'accept-version': '1.2' }, () => {
      isConnected = true
      connectPromise = null
      resolve()
    }, (err: any) => {
      isConnected = false
      connectPromise = null
      console.error('[WebSocket] STOMP Error', err)
      reject(err)
    })
  })
  return connectPromise
}

export function disconnectWebSocket() {
  if (stompClient && isConnected) {
    Object.values(subscriptions).forEach((sub: any) => sub.unsubscribe && sub.unsubscribe())
    subscriptions = {}
    stompClient.disconnect(() => {
      isConnected = false
      stompClient = null
    })
  }
}

export async function subscribe(topic: string, callback: (msg: any) => void): Promise<void> {
  await connectWebSocket()
  if (!stompClient || !isConnected) return
  if (subscriptions[topic]) {
    subscriptions[topic].unsubscribe()
  }
  subscriptions[topic] = stompClient.subscribe(topic, callback)
}

export function unsubscribe(topic: string) {
  if (subscriptions[topic]) {
    subscriptions[topic].unsubscribe()
    delete subscriptions[topic]
  }
}

export async function sendMessage(destination: string, body: any) {
  await connectWebSocket()
  if (stompClient && isConnected) {
    stompClient.send(destination, JSON.stringify(body))
  }
}

export function getStompClient() {
  return stompClient
}
