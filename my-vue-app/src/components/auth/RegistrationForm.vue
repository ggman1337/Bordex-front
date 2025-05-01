<template>
  <div>
    <Card v-if="!showFullForm" class="max-w-md w-full mx-auto bg-transparent">
      <CardHeader>
        <CardTitle class="text-xl font-bold mb-2">Создайте аккаунт</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="() => { console.log('Form submit event triggered'); onSubmit(); }" class="space-y-6">
          <FormField v-slot="{ value, handleChange, meta }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="name@example.ru"
                  :modelValue="value"
                  @update:modelValue="(newValue) => {
                    console.log('Email value updated:', newValue);
                    handleChange(newValue);
                  }"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ value, handleChange, meta }" name="terms">
             <FormItem class="flex items-center space-x-2 pt-2">
               <FormControl>
                 <input
                   type="checkbox"
                   :checked="!!value"
                   @change="(e) => {
                     const isChecked = (e.target as HTMLInputElement)?.checked;
                     console.log('Checkbox value:', isChecked);
                     handleChange(isChecked ?? false);
                   }"
                   id="terms"
                   class="accent-blue-600 w-4 h-4 rounded focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 border-gray-300"
                  />
                </FormControl>
               <FormLabel for="terms" class="text-sm font-medium leading-none !mt-0">
                 Я принимаю <a href="#" class="underline">условия использования</a>
               </FormLabel>
               <FormMessage />
             </FormItem>
           </FormField>

          <pre class="text-xs text-red-500">{{ initialFormErrors }}</pre>

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
      <Card class="max-w-md w-full mx-auto bg-transparent mt-4">
        <CardHeader>
          <CardTitle>Завершите регистрацию</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="onFullSubmit" class="space-y-4">
            <FormField v-slot="{ componentField }" name="username">
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Введите username" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="firstName">
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Введите имя" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="lastName">
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Введите фамилию" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" disabled v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Введите пароль" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="passwordConfirm">
              <FormItem>
                <FormLabel>Подтвердите пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Подтвердите пароль" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button type="submit" class="w-full main-btn mt-6">Зарегистрироваться</Button>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { toast } from 'vue-sonner' // Assuming you use vue-sonner for toasts

// Import Shadcn/Vue components
import Button from '@/components/ui/button/Button.vue'
import {
  FormControl,
  // FormDescription, // Not used currently
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Input from '@/components/ui/input/Input.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'

// --- Initial Form Logic ---

const initialFormSchema = toTypedSchema(z.object({
  email: z.string().min(1),
  terms: z.boolean().refine(val => val, 'Требуется согласие')
}));

// Use useForm for the initial form
const { 
  handleSubmit: handleInitialSubmit, 
  errors: initialFormErrors,
  values: formValues
} = useForm({
  validationSchema: initialFormSchema,
  initialValues: { email: '', terms: false },
});

watch(initialFormErrors, (errors) => {
  console.log('Validation errors:', errors);
}, { deep: true });

watch(formValues, (newVal) => {
  console.log('Current form state:', {
    email: newVal.email,
    terms: newVal.terms,
    isValid: !initialFormErrors.value.email && !initialFormErrors.value.terms
  });
}, { deep: true });

// --- Full Form Logic ---

const showFullForm = ref(false);

// Schema for the full registration form, including password confirmation
const fullFormSchema = toTypedSchema(
  z.object({
    username: z.string().min(1, 'Введите username'),
    firstName: z.string().min(1, 'Введите имя'),
    lastName: z.string().min(1, 'Введите фамилию'),
    email: z.string().email('Неверный email'), // Should be pre-filled and validated
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    passwordConfirm: z.string().min(1, 'Подтвердите пароль'),
  })
  // Add refinement to check if passwords match
  .refine(data => data.password === data.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"], // Show error message on the confirmation field
  })
);

// Use a SEPARATE useForm instance for the full form
const { handleSubmit: handleFullSubmit, setFieldValue: setFullFormFieldValue, values: fullFormValues } = useForm({
  validationSchema: fullFormSchema,
  // Initial values for the second form (email will be set later)
  initialValues: {
    username: '',
    firstName: '',
    lastName: '',
    email: '', // Placeholder, will be updated
    password: '',
    passwordConfirm: '',
  },
});

// --- Submission Handlers ---

// Handler for the initial form submission
const onSubmit = handleInitialSubmit(async (values) => {
  console.log('Validation passed! Form values:', values);
  // Here you might typically verify the email, e.g., send a code

  // Set the email value in the *second* form's state using setFieldValue
  setFullFormFieldValue('email', values.email);

  // Show the full registration form
  showFullForm.value = true;

  toast.success('Пожалуйста, завершите регистрацию.'); // Optional feedback
});

// Handler for the full form submission
const onFullSubmit = handleFullSubmit(async (values) => {
  // values here are from the *second* form's state, managed by its useForm instance
  console.log('Full registration submitted:', values);

  // --- IMPORTANT ---
  // Password matching is already handled by the Zod schema's .refine()
  // No need for an explicit check here unless you want additional logic.

  try {
    // --- Placeholder for your actual registration API call ---
    // const response = await api.registerUser(values);
    // console.log('Registration successful:', response);
    toast.success('Аккаунт успешно создан!');
    // Redirect user or update UI state
    // e.g., router.push('/dashboard');
    // --- End Placeholder ---

  } catch (error) {
    console.error('Registration failed:', error);
    toast.error('Ошибка регистрации. Пожалуйста, попробуйте снова.');
    // Handle specific API errors here if needed
  }
});

</script>

<style scoped>
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
</style>