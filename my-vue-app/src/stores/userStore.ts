import { defineStore } from 'pinia'
import type { Avatar } from '@/components/boards/types'

export interface User {
  id: number
  name: string
  avatar: Avatar
}

export interface UserState {
  id: number
  name: string
  avatar: Avatar
  users: User[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: 1,
    name: 'AA',
    avatar: {
      initials: 'AA',
      img: 'https://storage.yandexcloud.net/s3-metaratings-storage/images/6b/d9/6bd9fffe181aa80f5341bd87aee4b756.jpg'
    },
    users: [
      {
        id: 1,
        name: 'AA',
        avatar: {
          initials: 'AA',
          img: 'https://storage.yandexcloud.net/s3-metaratings-storage/images/6b/d9/6bd9fffe181aa80f5341bd87aee4b756.jpg'
        }
      },
      {
        id: 2,
        name: 'SD',
        avatar: { initials: 'SD' }
      },
      {
        id: 3,
        name: 'KO',
        avatar: { initials: 'KO' }
      }
    ]
  }),
  getters: {
    getUserById: (state) => (id: number) => state.users.find(u => u.id === id)
  }
})
