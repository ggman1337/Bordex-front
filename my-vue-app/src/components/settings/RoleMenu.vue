<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button class="inline-flex items-center px-2 py-1 rounded border bg-white dark:bg-dark-700 hover:bg-muted dark:hover:bg-dark-600 text-xs font-semibold shadow-sm border-gray-300 dark:border-dark-400">
          <span v-if="roles.length">{{ roles.join(', ') }}</span>
          <span v-else class="text-muted-foreground">Нет ролей</span>
          <svg class="ml-1 w-4 h-4 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[180px] max-h-[220px] overflow-y-auto custom-scroll">
        <div v-for="role in allRoles" :key="role">
          <label class="flex items-center gap-2 px-2 py-1 cursor-pointer">
            <input type="checkbox" :checked="roles.includes(role)" :disabled="loading" @change="toggleRole(role)" />
            <span>{{ role }}</span>
          </label>
        </div>
        <div v-if="loading" class="px-2 py-1 text-xs text-muted-foreground">Сохраняем...</div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
const props = defineProps({
  user: { type: Object, required: true },
  boardId: { type: [Number, String], required: true },
  roles: { type: Array, required: true },
  allRoles: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['update-roles'])

const localRoles = ref([...props.roles])
watch(() => props.roles, (val) => { localRoles.value = [...val] })

function toggleRole(role) {
  const idx = localRoles.value.indexOf(role)
  if (idx === -1) {
    localRoles.value.push(role)
  } else {
    localRoles.value.splice(idx, 1)
  }
  emit('update-roles', { userId: props.user.id, roles: [...localRoles.value] })
}
</script>

<style scoped>
button {
  min-width: 90px;
}
input[type="checkbox"] {
  accent-color: #2563eb;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #2563eb #f3f4f6;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #2563eb;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}
</style>
