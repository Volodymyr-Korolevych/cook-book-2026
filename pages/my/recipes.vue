<template>
  <div class="space-y-6">
    <div class="flex items-baseline justify-between gap-3">
      <h1 class="text-2xl font-semibold">Мої рецепти</h1>
<!--       <NuxtLink
        to="/recipes/create"
        class="rounded-full bg-primary text-white text-sm px-4 py-2 hover:bg-orange-500 transition"
      >
        Створити рецепт
      </NuxtLink> -->
    </div>

    <p v-if="loaded && recipes.length === 0" class="text-sm text-gray-600">
      У вас ще немає рецептів.
    </p>

    <RecipeGrid
      v-else
      :recipes="recipes"
      @openMenu="openActionMenu"
    />

    <teleport to="body">
      <div v-if="showActions" class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 p-5 space-y-3">
          <div class="font-semibold">Дії з рецептом</div>

          <button
            type="button"
            class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
            @click="goEdit"
          >
            Редагувати
          </button>

          <button
            type="button"
            class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
            @click="toggleStatus"
          >
            Змінити статус (публічний/приватний)
          </button>

          <button
            type="button"
            class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
            @click="openDeleteConfirm"
          >
            Видалити
          </button>

          <button
            type="button"
            class="w-full px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
            @click="closeActions"
          >
            Закрити
          </button>
        </div>
      </div>
    </teleport>

    <Modal
      :model-value="showDeleteConfirm"
      title="Видалити рецепт?"
      cancel-text="Скасувати"
      confirm-text="Видалити"
      @cancel="showDeleteConfirm = false"
      @confirm="deleteRecipe"
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

const showActions = ref(false)
const selectedRecipe = ref<any | null>(null)
const showDeleteConfirm = ref(false)

const load = async () => {
  if (!user.value) return
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .eq('author_id', user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    addToast('Сталася помилка. Спробуйте ще раз')
    return
  }
  recipes.value = data || []
  loaded.value = true
}

onMounted(load)

const openActionMenu = (recipe: any) => {
  selectedRecipe.value = recipe
  showActions.value = true
}

const closeActions = () => {
  showActions.value = false
  selectedRecipe.value = null
}

const goEdit = () => {
  if (!selectedRecipe.value) return
  const id = selectedRecipe.value.id
  closeActions()
  router.push(`/recipes/${id}/edit`)
}

const toggleStatus = async () => {
  if (!selectedRecipe.value) return
  const r = selectedRecipe.value
  const next = !r.is_public
  const { error } = await client.from('recipes').update({ is_public: next }).eq('id', r.id)
  if (error) {
    addToast('Недостатньо прав для виконання дії')
    return
  }
  addToast('Статус рецепта змінено')
  closeActions()
  await load()
}

const openDeleteConfirm = () => {
  showDeleteConfirm.value = true
}

const deleteRecipe = async () => {
  if (!selectedRecipe.value) return
  const { error } = await client.from('recipes').delete().eq('id', selectedRecipe.value.id)
  showDeleteConfirm.value = false
  closeActions()

  if (error) {
    addToast('Недостатньо прав для виконання дії')
    return
  }
  addToast('Рецепт видалено')
  await load()
}
</script>
