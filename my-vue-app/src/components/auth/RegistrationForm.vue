<template>
  <div >
    <Card v-if="!showFullForm" class="max-w-md w-full mx-auto bg-transparent">
      <CardHeader>
        <CardTitle class="text-xl font-bold mb-2">Создайте аккаунт</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div>
            <label>Email</label>
            <Input type="email" placeholder="name@example.ru" v-model="email" />
            <p v-if="isSubmitted && !email" class="error-message">Обязательное поле</p>
          </div>
          <Button type="submit" class="w-full main-btn">Продолжить</Button>

          <div class="flex items-center my-2">
            <span class="flex-1 border-t"></span>
            <span class="mx-2 text-xs text-muted-foreground">или</span>
            <span class="flex-1 border-t"></span>
          </div>

          <Button type="button" variant="outline" class="w-full flex items-center justify-center gap-2 telegram-btn">
             <svg width="20" height="20" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="telegram-icon"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="120" cy="120" r="120" fill="#29B6F6"></circle><path d="M179.5 79.5L158.5 171.5C158.5 171.5 157.5 176.5 152.5 176.5C149.5 176.5 148 175 148 175L97.5 135.5L74.5 124.5L51.5 117.5C51.5 117.5 48 116.5 48 113C48 109.5 52.5 108.5 52.5 108.5L175.5 60.5C175.5 60.5 180.5 59 181.5 62C182.5 65 179.5 79.5 179.5 79.5Z" fill="white"></path><path d="M113 154.5L96.5 171.5C96.5 171.5 95.5 172.5 94 172.5C93.5 172.5 93 172.5 92.5 172L97.5 135.5L113 154.5Z" fill="#B0BEC5"></path><path d="M148 92.5L97.5 135.5L113 154.5L97.5 135.5L148 92.5Z" fill="#CFD8DC"></path></g></svg>
            <span>Продолжить с Telegram</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter />
    </Card>

    <div v-if="showFullForm">
      <Card class="max-w-md w-full mx-auto bg-transparent mt-4 scale-75">
        <CardHeader>
          <CardTitle>Завершите регистрацию</CardTitle>
          <Button type="button" @click="goBack" class="mt-2">Назад</Button>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="onFullSubmit" class="space-y-4">
            <div>
              <label>Username</label>
              <Input type="text" placeholder="Введите username" v-model="username" />
              <p v-if="isSubmitted && !username" class="error-message">Введите username</p>
            </div>
            <div>
              <label>Имя</label>
              <Input type="text" placeholder="Введите имя" v-model="firstName" />
              <p v-if="isSubmitted && !firstName" class="error-message">Введите имя</p>
            </div>
            <div>
              <label>Фамилия</label>
              <Input type="text" placeholder="Введите фамилию" v-model="lastName" />
              <p v-if="isSubmitted && !lastName" class="error-message">Введите фамилию</p>
            </div>
            <div>
              <label>Email</label>
              <Input type="email" placeholder="Email" disabled v-model="email" />
              <p v-if="isSubmitted && (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))" class="error-message">Неверный email</p>
            </div>
            <div>
              <label>Пароль</label>
              <Input type="password" placeholder="Введите пароль" v-model="password" />
              <p v-if="isSubmitted && password.length < 6" class="error-message">Пароль должен быть не менее 6 символов</p>
            </div>
            <div>
              <label>Подтвердите пароль</label>
              <Input type="password" placeholder="Подтвердите пароль" v-model="passwordConfirm" />
              <p v-if="isSubmitted && password !== passwordConfirm" class="error-message">Пароли не совпадают</p>
            </div>
            <Button type="submit" class="w-full main-btn mt-6">Зарегистрироваться</Button>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'

// --- Reactive Form State ---
const router = useRouter();

const email = ref('');
const terms = ref(false);
const username = ref('');
const firstName = ref('');
const lastName = ref('');
const password = ref('');
const passwordConfirm = ref('');
const isSubmitted = ref(false);

const showFullForm = ref(false);

// --- Validation Logic ---

const validateInitialForm = () => {
  const errors = {
    email: '',
  };

  if (!email.value) {
    errors.email = 'Обязательное поле';
  }

  return errors;
};

const validateFullForm = () => {
  const errors = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  };

  if (!username.value) {
    errors.username = 'Введите username';
  }

  if (!firstName.value) {
    errors.firstName = 'Введите имя';
  }

  if (!lastName.value) {
    errors.lastName = 'Введите фамилию';
  }

  if (!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    errors.email = 'Неверный email';
  }

  if (password.value.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов';
  }

  if (password.value !== passwordConfirm.value) {
    errors.passwordConfirm = 'Пароли не совпадают';
  }

  return errors;
};

// --- Submission Handlers ---

const onSubmit = () => {
  const errors = validateInitialForm();
  if (errors.email) {
    return;
  }
  showFullForm.value = true;
  toast('Пожалуйста, завершите регистрацию.');
};

const onFullSubmit = async () => {
  isSubmitted.value = true;
  nextTick(() => {
    isSubmitted.value = true;
  });
  const errors = validateFullForm();
  if (Object.values(errors).some(error => error)) {
    return;
  }
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        firstName: firstName.value,
        lastName: lastName.value,
        password: password.value,
        email: email.value,
        passwordConfirm: passwordConfirm.value
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || response.statusText || 'Ошибка регистрации';
      toast(`Ошибка регистрации`, {
        description: errorMsg,
      });
      return;
    }
    toast('Аккаунт успешно создан!', {
      description: 'Теперь вы можете войти в систему.',
      action: {
        label: 'Войти',
        onClick: () => router.push('/login'),
      },
    });
    // Можно добавить редирект или очистку формы
  } catch (error) {
    if (error instanceof Error) {
      toast('Ошибка регистрации', {
        description: error.message + '. Пожалуйста, попробуйте снова.',
      });
    } else {
      toast('Ошибка регистрации', {
        description: 'Пожалуйста, попробуйте снова.',
      });
    }
  }
};

const goBack = () => {
  showFullForm.value = false;
  terms.value = false;
};
</script>

<style scoped>
.error-message {
  color: red;
  font-size: 0.875rem;
}
/* Add styles from your original example */
input[type="checkbox"] {
  /* Ensure consistent sizing and appearance */
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem; /* Align better with label */
}
input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2997ff44; /* Use accent color for focus */
}
.input-desc {
  color: #a0a0a0;
  font-size: 0.88rem;
  margin-top: 2px;
}
.main-btn {
  background: #18191c;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.2s;
}
.main-btn:hover {
  background: #23242a;
}
.telegram-btn {
  /* Adjusted border for better visibility with outline variant */
  border: 1.5px solid #29b6f6;
  /* background: #fff;  <- variant="outline" handles background */
  color: #29b6f6; /* Make text blue */
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.telegram-btn:hover {
  background-color: #29b6f61a; /* Lighter blue background on hover */
  box-shadow: 0 2px 8px #29b6f622;
  /* border-color: #2997ff; <- Let hover state manage this if needed */
}
/* Ensure icon color matches text color changes on hover */
.telegram-btn:hover .telegram-icon circle {
  /* Keep icon background */
}
.telegram-btn:hover .telegram-icon path {
  /* Keep icon paths */
}
.telegram-icon {
  /* margin-right: 6px; <- Handled by gap-2 class */
  /* vertical-align: middle; <- Handled by flex items-center */
}

/* Responsive styles */
@media (max-width: 900px) {
  .max-w-md {
    max-width: 100vw !important;
    margin: 0 !important;
    border-radius: 0 !important;
    border-left: none; /* Remove side borders on mobile */
    border-right: none;
  }
  /* Add padding inside card content on mobile */
  .card > :deep(div[data-radix-vue-collection-item]:first-child), /* CardHeader */
  .card > :deep(div[data-radix-vue-collection-item]:nth-child(2)) /* CardContent */
   {
     padding-left: 1rem;
     padding-right: 1rem;
   }

}

.max-w-md {
  width: 500px;  /* Сохраняем ширину */
  overflow-y: auto; /* Оставляем на случай переполнения */
}

.vue-sonner-toast {
  z-index: 9999; /* Убедитесь, что уведомления отображаются поверх других элементов */
  background-color: rgba(0, 0, 0, 0.8); /* Сделайте фон более заметным */
  color: white; /* Убедитесь, что текст читаем */
  position: fixed;
  top: 10px; /* Измените позицию, чтобы уведомления были видны */
  right: 10px;
}
</style>