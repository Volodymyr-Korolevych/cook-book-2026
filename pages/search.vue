<template>
    <div class="space-y-6">
        <h1 class="text-xl font-semibold">
            Результати пошуку
        </h1>

        <p v-if="!recipes.length && loaded" class="text-sm text-gray-500">
            Нічого не знайдено за запитом «{{ q }}».
        </p>

        <RecipeGrid v-else-if="recipes.length" :recipes="recipes" @saveAsGuest="openGuestModal" />

        <Modal :model-value="showGuestModal" title="Увійдіть, щоб зберігати рецепти"
            message="Збережені рецепти будуть доступні у вашому профілі." cancel-text="Закрити" confirm-text="Увійти"
            @cancel="showGuestModal = false" @confirm="goAuth" />
    </div>
</template>

<script setup lang="ts">
import RecipeGrid from '~/components/RecipeGrid.vue'
import Modal from '~/components/Modal.vue'
import { useRecipes } from '~/composables/useRecipes'

const route = useRoute()
const router = useRouter()

const q = computed(() => (route.query.q as string) || '')
const { searchRecipes } = useRecipes()

const recipes = ref<any[]>([])
const loaded = ref(false)
const showGuestModal = ref(false)

watch(
    q,
    async (value) => {
        const trimmed = value.trim()
        recipes.value = trimmed ? await searchRecipes(trimmed) : []
        loaded.value = true
    },
    { immediate: true }
)

const openGuestModal = () => {
    showGuestModal.value = true
}

const goAuth = () => {
    showGuestModal.value = false
    router.push('/auth')
}
</script>
