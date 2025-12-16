<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Профіль</h1>

    <div class="border rounded-2xl p-5 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
          {{ initials }}
        </div>

        <div class="space-y-1">
          <div class="font-semibold">
            {{ profileName || 'Користувач' }}
          </div>
          <div v-if="user?.email" class="text-sm text-gray-600">
            {{ user.email }}
          </div>
        </div>
      </div>

      <button
        type="button"
        class="px-4 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
        @click="onLogout"
      >
        Вийти
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <NuxtLink to="/my/recipes" class="border rounded-2xl p-4 hover:bg-gray-50 transition">
        <div class="font-semibold">Мої рецепти</div>
      </NuxtLink>

      <NuxtLink to="/my/saved" class="border rounded-2xl p-4 hover:bg-gray-50 transition">
        <div class="font-semibold">Збережені рецепти</div>
      </NuxtLink>

      <NuxtLink to="/recipes/create" class="border rounded-2xl p-4 hover:bg-gray-50 transition">
        <div class="font-semibold">Створити рецепт</div>
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
