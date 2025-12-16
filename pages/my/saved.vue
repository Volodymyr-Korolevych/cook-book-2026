<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Збережені рецепти</h1>

    <p v-if="loaded && recipes.length === 0" class="text-sm text-gray-600">
      Ви ще не зберегли жодного рецепта.
    </p>

    <RecipeGrid
      v-else
      :recipes="recipes"
      @toggleSave="toggleSave"
      @saveAsGuest="openGuestModal"
    />

    <Modal
      :model-value="showGuestModal"
      title="Увійдіть, щоб зберігати рецепти"
      message="Збережені рецепти будуть доступні у вашому профілі."
      cancel-text="Закрити"
      confirm-text="Увійти"
      @cancel="showGuestModal = false"
      @confirm="goAuth"
    />
  </div>
</template>

<script setup lang="ts">
import RecipeGrid from '~/components/RecipeGrid.vue'
import Modal from '~/components/Modal.vue'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const { addToast } = useToasts()

const recipes = ref<any[]>([])
const loaded = ref(false)
const showGuestModal = ref(false)

const load = async () => {
  if (!user.value) return
  const { data, error } = await client
    .from('saved_recipes')
    .select('recipe_id, recipes(*)')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    addToast('Сталася помилка. Спробуйте ще раз')
    return
  }

  recipes.value = (data || []).map((row: any) => row.recipes).filter(Boolean)
  loaded.value = true
}

onMounted(load)

const openGuestModal = () => {
  showGuestModal.value = true
}

const goAuth = () => {
  showGuestModal.value = false
  router.push('/auth')
}

const toggleSave = async (recipe: any) => {
  if (!user.value) return
  const { error } = await client
    .from('saved_recipes')
    .delete()
    .eq('user_id', user.value.id)
    .eq('recipe_id', recipe.id)

  if (error) {
    addToast('Недостатньо прав для виконання дії')
    return
  }
  addToast('Рецепт видалено із збережених')
  await load()
}
</script>
