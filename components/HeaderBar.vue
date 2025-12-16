<template>
    <header class="border-b bg-white">
        <div class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center gap-4">
            <!-- ЛОГО -->
            <div class="font-semibold text-lg">
                Кулінарні рецепти
            </div>

            <!-- ПОШУК (по центру) -->
            <div class="flex-1 flex justify-center">
                <form class="w-full max-w-md" @submit.prevent="onSearch">
                    <input v-model="query" type="search" placeholder="Знайти рецепт..."
                        class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </form>
            </div>

            <!-- ДІЇ КОРИСТУВАЧА -->
            <div class="flex items-center gap-3">
                <button v-if="user" type="button"
                    class="hidden sm:inline-flex items-center rounded-full bg-primary text-white text-sm px-4 py-2 hover:bg-orange-500 transition"
                    @click="goCreate">
                    Створити рецепт
                </button>

                <button v-if="!user" type="button"
                    class="text-sm border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50" @click="goAuth">
                    Вхід
                </button>

                <button v-else type="button"
                    class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-300"
                    @click="goProfile">
                    {{ initials }}
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const user = useSupabaseUser()

const query = ref<string>((route.query.q as string) || '')

const onSearch = () => {
    const q = query.value.trim()
    if (!q) return
    router.push({ path: '/search', query: { q } })
}

const goAuth = () => router.push('/auth')
const goProfile = () => router.push('/profile')
const goCreate = () => router.push('/recipes/create')

const initials = computed(() => {
    const email = user.value?.email ?? ''
    return email ? email.charAt(0).toUpperCase() : 'U'
})
</script>
