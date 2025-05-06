<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
    <div class="w-full max-w-md">
      <div class="flex justify-end mb-4 ">
        <button class="border border-blue-600 bg-white text-foreground dark:text-foreground dark:bg-black dark:hover:bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition" @click="goToRegister">Зарегистрироваться</button>
      </div>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
const router = useRouter()
function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-layout {
  display: flex;
  height: 100vh;
}
.login-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 40px 24px 56px;
}
.login-logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.login-logo-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.login-logo {
  width: 32px;
  height: 32px;
}
.login-brand {
  font-weight: bold;
  font-size: 1.3rem;
  margin-left: 0;
}
.login-register-btn {
  padding: 6px 24px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.2s;
}
.login-register-btn:hover {
  /* hover styles applied via Tailwind classes */
}
.login-main-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.login-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.login-desc {
  font-size: 1rem;
  margin-bottom: 32px;
}
.login-board-img {
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 #0002;
  margin-bottom: 24px;
  display: block;
}
.login-board-img.enlarged {
  max-width: 800px;
  width: 100%;
}
.login-footer {
  font-size: 0.96rem;
}
.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.login-register-btn-wrap {
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
  .login-register-btn-wrap {
    padding: 16px 16px 0 0;
  }
}
</style>
