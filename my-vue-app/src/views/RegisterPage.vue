<template>
  <div class="register-layout bg-background text-foreground">
    <div class="register-left bg-background text-foreground">
      <div class="register-logo-row">
        <div class="register-logo-brand">
          <svg class="w-8 h-8 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15.9999V7.9999C20.9996 7.64917 20.9071 7.30471 20.7315 7.00106C20.556 6.69741 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09436 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09436 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69741 3.26846 7.00106C3.09294 7.30471 3.00036 7.64917 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9978 12 21.9978C12.3511 21.9978 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999Z" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 4.20996L12 6.80996L16.5 4.20996" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 19.79V14.6L3 12" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12L16.5 14.6V19.79" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22.08V12" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="register-brand">Bordex</span>
        </div>
      </div>
      <div class="register-main-text">
        <h1 class="register-title">Управляйте задачами<br />команды в одном месте</h1>
        <p class="register-desc text-foreground dark:text-muted-foreground">Bordex помогает командам перемещать работу вперёд.<br>Совместно работайте, управляйте задачами и достигайте новых пиков продуктивности.</p>
        <img src="@/assets/register-mock-light.png" alt="Скриншот доски" v-if="routeInline === 'inline'" class="register-board-img large-img" />
        <img src="@/assets/register-mock.png" alt="Скриншот доски" v-else="routeInline === 'none'" class="register-board-img large-img" />
      </div>
      <div class="register-footer text-foreground dark:text-muted-foreground"> 2025 Bordex.</div>
    </div>
    <div class="register-right bg-white dark:bg-black">
      <div class="register-login-btn-wrap"><button class="register-login-btn border border-blue-600 bg-white text-foreground dark:text-foreground dark:bg-black dark:hover:bg-blue-600 hover:bg-blue-600">Войти</button></div>
      <div class="w-full flex justify-center">
        <RegistrationForm class="w-full max-w-md" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
// Цвет иконок в зависимости от темы (реактивно)
const routeColor = ref('#000')
const routeInline = ref('none')
let observer: MutationObserver | null = null

function updateRouteColor() {
  routeColor.value = document.documentElement.classList.contains('dark') ? '#fff' : '#000'
}

function updateRouteInline() {
  routeInline.value = document.documentElement.classList.contains('dark') ? 'inline' : 'none'
}

onMounted(() => {
  updateRouteColor()
  updateRouteInline()
  observer = new MutationObserver(() => {
    updateRouteColor()
    updateRouteInline()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
import RegistrationForm from '@/components/auth/RegistrationForm.vue'
</script>

<style scoped>
.register-layout {
  display: flex;
  height: 100vh;
}
.register-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 40px 24px 56px;
  position: relative;
}
.register-logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.register-logo-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.register-logo {
  width: 32px;
  height: 32px;
}
.register-brand {
  font-weight: bold;
  font-size: 1.3rem;
  margin-left: 0;
}
.register-login-btn {
  padding: 6px 24px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.2s;
}
.register-login-btn:hover {
  /* hover styles applied via Tailwind classes */
}
.register-main-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.register-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.register-desc {
  font-size: 1rem;
  margin-bottom: 32px;
}
.register-board-img {
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 #0002;
  margin-bottom: 24px;
  display: block;
}
.register-board-img.enlarged {
  max-width: 800px;
  width: 100%;
}
.register-footer {
  font-size: 0.96rem;
}
.register-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.register-login-btn-wrap {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 32px 48px 0 0;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}
@media (prefers-color-scheme: dark) {
  .logo-light { display: none; }
  .logo-dark { display: inline; }
}
@media (prefers-color-scheme: light) {
  .logo-light { display: inline; }
  .logo-dark { display: none; }
}
@media (max-width: 900px) {
  .register-login-btn-wrap {
    padding: 16px 16px 0 0;
  }
}
</style>
