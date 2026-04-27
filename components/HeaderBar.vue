<template>
    <header class="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-stone-200">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <!-- Left: logo -->
            <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
                <div
                    class="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
                    <span class="text-base leading-none">🍴</span>
                </div>
                <div class="hidden sm:block font-serif text-lg font-semibold tracking-wide text-gray-900">
                    Щоденник рецептів
                </div>
            </NuxtLink>

            <!-- Center: search -->
            <div class="flex-1 flex justify-center">
                <form class="w-full max-w-xl" @submit.prevent="onSearch">
                    <div class="relative">
                        <input v-model="q" type="text" class="w-full border border-stone-300 bg-white rounded-full pl-4 pr-12 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Пошук за назвою або інгредієнтами…" />
                        <button type="submit" class="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-sm
               border border-stone-300 bg-white hover:bg-stone-50 transition" aria-label="Search">
                            🔎
                        </button>
                    </div>
                </form>
            </div>

            <!-- ✅ Added: menu items for logged-in user -->
            <nav v-if="user" class="hidden lg:flex items-center gap-3 shrink-0">
                <NuxtLink
                    to="/my/recipes"
                    class="text-sm text-gray-700 hover:text-primary transition"
                >
                    Мої рецепти
                </NuxtLink>

                <NuxtLink
                    to="/my/saved"
                    class="text-sm text-gray-700 hover:text-primary transition"
                >
                    Збережені рецепти
                </NuxtLink>
            </nav>

            <!-- Right: auth / actions -->
            <div class="flex items-center gap-2 shrink-0">
                <NuxtLink v-if="user" to="/recipes/create"
                    class="hidden sm:inline-flex rounded-full bg-primary text-white text-sm px-4 py-2 hover:bg-primaryHover transition shadow-sm">
                    Створити рецепт
                </NuxtLink>

                <NuxtLink v-if="!user" to="/auth"
                    class="rounded-full border border-stone-300 bg-white text-sm px-4 py-2 hover:bg-stone-50 transition">
                    Вхід
                </NuxtLink>

                <NuxtLink v-else to="/profile"
                    class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-semibold text-sm hover:bg-stone-300 transition"
                    aria-label="Profile">
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
