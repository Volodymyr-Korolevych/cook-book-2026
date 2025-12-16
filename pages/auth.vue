<template>
  <div class="max-w-lg mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Вхід / Реєстрація</h1>

    <div
      v-if="authMessage"
      class="border rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-800"
    >
      {{ authMessage }}
    </div>

    <div class="flex gap-2">
      <button
        type="button"
        class="px-4 py-2 rounded-full text-sm border"
        :class="mode === 'login' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-50'"
        @click="mode = 'login'"
      >
        Вхід
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded-full text-sm border"
        :class="mode === 'register' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-50'"
        @click="mode = 'register'"
      >
        Реєстрація
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div v-if="mode === 'register'" class="space-y-1">
        <label class="text-sm font-medium">Ім’я</label>
        <input
          v-model="displayName"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ваше ім’я"
        />
        <p v-if="errors.displayName" class="text-xs text-red-600">
          {{ errors.displayName }}
        </p>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="name@example.com"
        />
        <p v-if="errors.email" class="text-xs text-red-600">
          {{ errors.email }}
        </p>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium">Пароль</label>
        <input
          v-model="password"
          type="password"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="••••••••"
        />
        <p v-if="errors.password" class="text-xs text-red-600">
          {{ errors.password }}
        </p>
      </div>

      <div v-if="formError" class="border rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-800">
        {{ formError }}
      </div>

      <button
        type="submit"
        class="w-full rounded-full bg-primary text-white py-2 text-sm hover:bg-orange-500 transition"
        :disabled="loading"
      >
        {{ loading ? 'Зачекайте…' : (mode === 'login' ? 'Увійти' : 'Зареєструватися') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { addToast } = useToasts()
const { authMessage } = useAuthRedirect()
const { signIn, signUp } = useAuth()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)

const email = ref('')
const password = ref('')
const displayName = ref('')

const errors = reactive<{ email?: string; password?: string; displayName?: string }>({})
const formError = ref('')

const validate = () => {
  errors.email = undefined
  errors.password = undefined
  errors.displayName = undefined
  formError.value = ''

  const e = email.value.trim()
  const p = password.value

  if (!e) errors.email = 'Вкажіть email'
  else if (!/^\S+@\S+\.\S+$/.test(e)) errors.email = 'Вкажіть коректний email'

  if (!p) errors.password = 'Вкажіть пароль'
  else if (mode.value === 'register' && p.length < 6) errors.password = 'Пароль має містити щонайменше 6 символів'

  if (mode.value === 'register') {
    const dn = displayName.value.trim()
    if (!dn) errors.displayName = 'Вкажіть ім’я'
    else if (dn.length < 2) errors.displayName = 'Ім’я має містити щонайменше 2 символи'
    else if (dn.length > 50) errors.displayName = 'Ім’я має бути не довше 50 символів'
  }

  return !errors.email && !errors.password && !errors.displayName
}

const onSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    if (mode.value === 'login') {
      await signIn(email.value.trim(), password.value)
      addToast('Ви увійшли в акаунт')
    } else {
      await signUp(email.value.trim(), password.value, displayName.value.trim())
      addToast('Акаунт створено')
    }
    await router.push('/profile')
  } catch {
    formError.value = mode.value === 'login'
      ? 'Неправильний email або пароль'
      : 'Не вдалося зареєструватися. Спробуйте ще раз'
  } finally {
    loading.value = false
  }
}
</script>
