import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BoardPage from '../BoardPage.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// Мокаем stores
let mockBoards = [{ id: 1, title: 'Test Board', columns: [{ id: 1, title: 'ToDo', tasks: [] }] }]
let mockCurrentBoard: { id: number; title: string; columns: { id: number; title: string; tasks: never[] }[] } | null = { id: 1, title: 'Test Board', columns: [{ id: 1, title: 'ToDo', tasks: [] }] }
let mockBoardById = (id: number) => mockBoards.find(b => b.id === id)

let mockFetchTasks = vi.fn().mockResolvedValue(undefined)

vi.mock('@/stores/boardStore', () => ({
  useBoardStore: () => ({
    boards: mockBoards,
    currentBoard: mockCurrentBoard,
    fetchBoards: vi.fn(),
    setCurrentBoard: vi.fn(),
    boardById: mockBoardById,
  })
}))
vi.mock('@/stores/taskStore', () => ({
  useTaskStore: () => ({
    tasks: [],
    fetchTasksForBoard: vi.fn(),
    disconnect: vi.fn(),
    columns: [{ id: 1, title: 'ToDo', tasks: [] }],
    fetchTasks: mockFetchTasks,
    connect: vi.fn(),
  })
}))

describe('BoardPage.vue', () => {
  let pinia: any
  let router: any

  beforeEach(async () => {
    // Сброс мок-данных перед каждым тестом
    mockBoards = [{ id: 1, title: 'Test Board', columns: [{ id: 1, title: 'ToDo', tasks: [] }] }]
    mockCurrentBoard = { id: 1, title: 'Test Board', columns: [{ id: 1, title: 'ToDo', tasks: [] }] }
    mockBoardById = (id: number) => mockBoards.find(b => b.id === id)
    mockFetchTasks = vi.fn().mockResolvedValue(undefined)
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createWebHistory(),
      routes: [ { path: '/boards/:id', component: BoardPage } ]
    })
    router.push('/boards/1')
    await router.isReady()
  })

  it('рендерит заголовок доски', async () => {
    const wrapper = mount(BoardPage, {
      global: { plugins: [pinia, router] }
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Test Board')
  })

  it('рендерит BoardColumn для каждой колонки', async () => {
    const wrapper = mount(BoardPage, {
      global: { plugins: [pinia, router] }
    })
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'BoardColumn' }).length).toBeGreaterThan(0)
  })

  it('отображает пустое состояние, если board не найден', async () => {
    mockBoards = []
    mockCurrentBoard = null
    mockBoardById = (_: number) => undefined
    const wrapper = mount(BoardPage, {
      global: { plugins: [pinia, router] }
    })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Test Board')
  })

  it('открывает и закрывает модалку создания задачи', async () => {
    const wrapper = mount(BoardPage, {
      global: { plugins: [pinia, router] }
    })
    await wrapper.vm.openNewTaskForm(1)
    await flushPromises()
    // Проверяем наличие текста в document.body, чтобы поймать teleported-модалку
    expect(document.body.innerHTML).toContain('Создать задачу')
    wrapper.vm.closeTaskModal()
    await wrapper.vm.$nextTick()
    expect(document.body.innerHTML).not.toContain('Создать задачу')
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })
})
