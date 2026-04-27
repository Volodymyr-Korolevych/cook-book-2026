<template>
    <header class="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-stone-200">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">

            <!-- Left -->
            <NuxtLink to="/" class="flex items-center gap-3 shrink-0">
                <div class="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                        <path d="M6 2v6M8 2v6M7 8v14" />
                        <path d="M16 2c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z" />
                        <path d="M16 10v12" />
                    </svg>
                </div>

                <div class="hidden sm:block font-serif text-lg font-semibold tracking-wide text-gray-900">
                    Щоденник рецептів
                </div>
            </NuxtLink>

            <!-- Center -->
            <div class="flex-1 flex justify-center px-2">
                <form class="w-full max-w-xl" @submit.prevent="onSearch">
                    <div class="relative">
                        <input v-model="q" type="text" class="w-full border border-stone-300 bg-white rounded-full pl-4 pr-12 py-2.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Пошук за назвою або інгредієнтами…" />

                        <button type="submit" class="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-sm font-medium
                            border border-stone-300 bg-white hover:bg-stone-50 transition">
                            🔎
                        </button>
                    </div>
                </form>
            </div>

            <!-- Menu -->
            <nav v-if="user" class="hidden lg:flex items-center gap-4 shrink-0">
                <NuxtLink to="/my/recipes" class="text-sm font-medium text-gray-700 hover:text-primary transition">
                    Мої рецепти
                </NuxtLink>

                <NuxtLink to="/my/saved" class="text-sm font-medium text-gray-700 hover:text-primary transition">
                    Збережені рецепти
                </NuxtLink>
            </nav>

            <!-- Right -->
            <div class="flex items-center gap-3 shrink-0">
                <NuxtLink v-if="user" to="/recipes/create"
                    class="hidden sm:inline-flex rounded-full bg-primary text-white text-sm font-medium px-4 py-2.5 hover:bg-primaryHover transition shadow-sm">
                    Створити рецепт
                </NuxtLink>

                <NuxtLink v-if="!user" to="/auth"
                    class="rounded-full border border-stone-300 text-sm font-medium px-4 py-2.5 hover:bg-stone-50 transition">
                    Вхід
                </NuxtLink>

                <NuxtLink v-else to="/profile"
                    class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-semibold text-sm hover:bg-stone-300 transition">
                    {{ initials }}
                </NuxtLink>
            </div>

        </div>
    </header>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const user = useSupabaseUser()

const q = ref<string>((route.query.q as string) || '')

const initials = computed(() => {
    const email = user.value?.email || ''
    return email ? email.charAt(0).toUpperCase() : 'U'
})

const onSearch = async () => {
    const value = q.value.trim()
    if (!value) {
        await router.push('/search')
        return
    }
    await router.push({ path: '/search', query: { q: value } })
}
</script>