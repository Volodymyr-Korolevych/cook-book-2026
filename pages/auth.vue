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
        :class="mode === 'login'
          ? 'bg-gray-900 text-white border-gray-900'
          : 'border-gray-300 hover:bg-gray-50'"
        @click="mode = 'login'"
      >
        Вхід
      </button>

      <button
        type="button"
        class="px-4 py-2 rounded-full text-sm border"
        :class="mode === 'register'
          ? 'bg-gray-900 text-white border-gray-900'
          : 'border-gray-300 hover:bg-gray-50'"
        @click="mode = 'register'"
      >
        Реєстрація
      </button>
    </div>

    <!--
      Important: block autofill as much as possible.
      - form autocomplete="off"
      - hidden honeypot inputs (browser often fills these instead)
      - real inputs use autocomplete hints that reduce password-manager overlays
    -->
    <form class="space-y-4" @submit.prevent="onSubmit" autocomplete="off">
      <!-- Honeypot (autofill trap). Keep before real fields -->
      <input
        type="text"
        name="username"
        autocomplete="username"
        tabindex="-1"
        class="absolute -left-[9999px] top-auto w-px h-px opacity-0 pointer-events-none"
      />
      <input
        type="password"
        name="password"
        autocomplete="current-password"
        tabindex="-1"
        class="absolute -left-[9999px] top-auto w-px h-px opacity-0 pointer-events-none"
      />

      <div v-if="mode === 'register'" class="space-y-1">
        <label class="text-sm font-medium" for="displayName">Ім’я</label>
        <input
          id="displayName"
          v-model="displayName"
          type="text"
          name="displayName"
          autocomplete="off"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ваше ім’я"
        />
        <p v-if="errors.displayName" class="mt-1 text-xs text-red-600">{{ errors.displayName }}</p>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          name="email"
          inputmode="email"
          autocapitalize="none"
          spellcheck="false"
          autocomplete="off"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="name@example.com"
        />
        <!-- Put error with spacing so overlay is less likely to cover it -->
        <p v-if="errors.email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium" for="passwordReal">Пароль</label>
        <input
          id="passwordReal"
          v-model="password"
          type="password"
          name="passwordReal"
          autocomplete="new-password"
          class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="••••••••"
        />
        <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
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

      <p v-if="mode === 'register'" class="text-xs text-gray-600">
        Пароль має містити щонайменше 6 символів.
      </p>
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

const resetErrors = () => {
  errors.email = undefined
  errors.password = undefined
  errors.displayName = undefined
  formError.value = ''
}

watch(mode, () => {
  resetErrors()
  // clear password to avoid browser-suggested values leaking between modes
  password.value = ''
  if (mode.value === 'login') displayName.value = ''
})

const validate = () => {
  resetErrors()

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
  } catch (e: any) {
    formError.value = String(e?.message || 'Сталася помилка. Спробуйте ще раз')
  } finally {
    loading.value = false
  }
}
</script>
