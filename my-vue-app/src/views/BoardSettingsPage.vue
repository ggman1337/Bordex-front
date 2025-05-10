<template>
  <MainLayout v-if="userStore.id && userStore.id !== 0" />
  <Dialog v-model:open="showSettings">
  <DialogPortal>
    <DialogOverlay />
    <DialogContent @close="closeSettings">
      <BoardSettingsForm />
    </DialogContent>
  </DialogPortal>
</Dialog>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore();
import { ref } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import BoardSettingsForm from '@/components/settings/BoardSettingsForm.vue'
import { Dialog, DialogOverlay, DialogContent } from '@/components/ui/dialog'
import { DialogPortal } from 'reka-ui'

const showSettings = ref(true)
function closeSettings() {
  showSettings.value = false
}
</script>

