<template>
    <div class="space-y-8">
        <!-- Hero -->
        <section>
            <h1 class="text-center text-2xl md:text-3xl font-semibold mb-2">
                Знаходь рецепти своїх улюблених страв
            </h1>
            <h1 class="text-center text-sm text-gray-600 mb-2">
                Переглядай нові страви, обирай сезонні і зберігай улюблені рецепти у своєму профілі
            </h1>
        </section>

        <!-- Сезонні -->
        <section v-if="seasonal.length">
            <h2 class="text-lg font-semibold mb-3">
                Сезонні рецепти
            </h2>
            <RecipeGrid :recipes="seasonal" @saveAsGuest="openGuestModal" />
        </section>

        <!-- Нові -->
        <section v-if="latest.length">
            <h2 class="text-lg font-semibold mb-3">
                Нові рецепти
            </h2>
            <RecipeGrid :recipes="latest" @saveAsGuest="openGuestModal" />
        </section>

        <Modal :model-value="showGuestModal" title="Увійдіть, щоб зберігати рецепти"
            message="Збережені рецепти будуть доступні у вашому профілі." cancel-text="Закрити" confirm-text="Увійти"
            @cancel="showGuestModal = false" @confirm="goAuth" />
    </div>
</template>

<script setup lang="ts">
import RecipeGrid from '~/components/RecipeGrid.vue'
import Modal from '~/components/Modal.vue'
import { useRecipes } from '~/composables/useRecipes'

const router = useRouter()
const { getSeasonalRecipes, getLatestRecipes } = useRecipes()

const seasonal = ref<any[]>([])
const latest = ref<any[]>([])
const showGuestModal = ref(false)

onMounted(async () => {
    seasonal.value = await getSeasonalRecipes()
    latest.value = await getLatestRecipes()
})

const openGuestModal = () => {
    showGuestModal.value = true
}

const goAuth = () => {
    showGuestModal.value = false
    router.push('/auth')
}
</script>
