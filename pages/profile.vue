<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">

    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Профіль</h1>
      <p class="text-sm text-gray-500 mt-1">
        Керуйте своїми рецептами та збереженими стравами
      </p>
    </div>

    <!-- Profile block -->
    <div class="bg-white rounded-2xl border border-stone-300 shadow-sm p-5 flex items-center justify-between">
      <div class="flex items-center gap-4">

        <div
          class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
          {{ initials }}
        </div>

        <div>
          <div class="font-semibold text-gray-900">
            {{ profileName }}
          </div>
          <div  v-if="user?.email" class="text-sm text-gray-500">
            {{ user.email }}
          </div>
        </div>
      </div>

      <button @click="onLogout"
        class="px-4 py-2.5 rounded-full border border-stone-300 text-sm font-medium hover:bg-stone-50 transition">
        Вийти
      </button>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <NuxtLink to="/my/recipes" class="rounded-2xl border border-stone-300 bg-white p-5 text-sm font-medium
               hover:border-primary hover:shadow-sm transition">
        Мої рецепти
      </NuxtLink>

      <NuxtLink to="/my/saved" class="rounded-2xl border border-stone-300 bg-white p-5 text-sm font-medium
               hover:border-primary hover:shadow-sm transition">
        Збережені рецепти
      </NuxtLink>

      <NuxtLink to="/recipes/create" class="rounded-2xl bg-primary text-white p-5 text-sm font-medium
               hover:bg-primaryHover shadow-sm transition">
        Створити рецепт
      </NuxtLink>

    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const { addToast } = useToasts()
const { signOut } = useAuth()

const profileName = ref<string>('')

const initials = computed(() => {
  const email = user.value?.email || ''
  return email ? email.charAt(0).toUpperCase() : 'U'
})

onMounted(async () => {
  if (!user.value) return
  const { data } = await client
    .from('profiles')
    .select('display_name')
    .eq('id', user.value.id)
    .maybeSingle()
  profileName.value = data?.display_name || ''
})

const onLogout = async () => {
  await signOut()
  addToast('Ви вийшли з акаунта')
  router.push('/')
}
</script>
