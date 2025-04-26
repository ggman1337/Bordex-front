import { defineStore } from 'pinia'
import type { Avatar } from '@/components/boards/types'

interface UserState {
  id: number
  name: string
  avatar: Avatar
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: 1,
    name: 'AA',
    avatar: { initials: 'AA', img: 'https://storage.yandexcloud.net/s3-metaratings-storage/images/6b/d9/6bd9fffe181aa80f5341bd87aee4b756.jpg' }
  })
})
