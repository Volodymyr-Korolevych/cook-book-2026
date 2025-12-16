<template>
  <div v-if="loading" class="text-sm text-gray-600">Завантаження…</div>

  <div v-else-if="!recipe" class="text-sm text-gray-600">
    Рецепт не знайдено.
  </div>

  <div v-else class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ recipe.title }}</h1>
        <div class="text-sm text-gray-600 mt-1">
          <span v-if="recipe.cook_time_minutes">Час: {{ recipe.cook_time_minutes }} хв</span>
          <span v-if="recipe.cook_time_minutes"> · </span>
          <span>Базові порції: {{ recipe.servings }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="user && !isAuthor"
          type="button"
          class="text-sm border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
          @click="toggleSave"
        >
          {{ isSaved ? 'Збережено' : 'Зберегти' }}
        </button>

        <button
          v-if="!user"
          type="button"
          class="text-sm border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50"
          @click="showGuestModal = true"
        >
          Зберегти
        </button>

        <button
          v-if="user && isAuthor"
          type="button"
          class="text-xl leading-none px-2 py-1 text-gray-500 hover:text-gray-900"
          @click="showActions = true"
          aria-label="Recipe actions"
        >
          ⋮
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-4">
        <div class="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
          <img v-if="recipe.main_image_url" :src="recipe.main_image_url" :alt="recipe.title" class="w-full h-full object-cover" />
        </div>

        <ServingsControl :current-servings="currentServings" @update:servings="currentServings = $event" />

        <div class="space-y-2">
          <h2 class="font-semibold">Інгредієнти</h2>
          <IngredientList
            :ingredients="ingredients"
            :base-servings="recipe.servings"
            :current-servings="currentServings"
          />
        </div>
      </div>

      <div class="space-y-6">
        <div v-if="recipe.description" class="space-y-2">
          <h2 class="font-semibold">Опис</h2>
          <p class="text-sm text-gray-800 whitespace-pre-line">{{ recipe.description }}</p>
        </div>

        <div class="space-y-2">
          <h2 class="font-semibold">Кроки</h2>
          <StepsList :steps="steps" />
        </div>
      </div>
    </div>

    <Modal
      :model-value="showGuestModal"
      title="Увійдіть, щоб зберігати рецепти"
      message="Збережені рецепти будуть доступні у вашому профілі."
      cancel-text="Закрити"
      confirm-text="Увійти"
      @cancel="showGuestModal = false"
      @confirm="goAuth"
    />

    <teleport to="body">
      <div v-if="showActions" class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 p-5 space-y-3">
          <div class="font-semibold">Дії з рецептом</div>

          <button type="button" class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm" @click="goEdit">
            Редагувати
          </button>

          <button type="button" class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm" @click="toggleStatus">
            Змінити статус (публічний/приватний)
          </button>

          <button type="button" class="w-full text-left px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm" @click="showDeleteConfirm = true">
            Видалити
          </button>

          <button type="button" class="w-full px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm" @click="showActions = false">
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
import Modal from '~/components/Modal.vue'
import ServingsControl from '~/components/ServingsControl.vue'
import IngredientList from '~/components/IngredientList.vue'
import StepsList from '~/components/StepsList.vue'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const { addToast } = useToasts()

const id = computed(() => route.params.id as string)

const loading = ref(true)
const recipe = ref<any | null>(null)
const ingredients = ref<any[]>([])
const steps = ref<any[]>([])

const currentServings = ref<number>(1)

const showGuestModal = ref(false)
const showActions = ref(false)
const showDeleteConfirm = ref(false)

const isAuthor = computed(() => user.value && recipe.value && user.value.id === recipe.value.author_id)
const isSaved = ref(false)

const load = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('id', id.value)
      .maybeSingle()

    if (error) throw error
    recipe.value = data || null
    ingredients.value = (data?.recipe_ingredients || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    steps.value = (data?.recipe_steps || []).sort((a: any, b: any) => (a.step_number ?? 0) - (b.step_number ?? 0))
    currentServings.value = data?.servings || 1

    if (user.value && data && user.value.id !== data.author_id) {
      const { data: saved, error: sErr } = await client
        .from('saved_recipes')
        .select('recipe_id')
        .eq('user_id', user.value.id)
        .eq('recipe_id', data.id)
        .maybeSingle()
      if (!sErr) isSaved.value = !!saved
    }
  } catch {
    recipe.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(user, load)

const goAuth = () => {
  showGuestModal.value = false
  router.push('/auth')
}

const toggleSave = async () => {
  if (!user.value || !recipe.value) return
  if (isSaved.value) {
    const { error } = await client
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.value.id)
      .eq('recipe_id', recipe.value.id)
    if (error) {
      addToast('Недостатньо прав для виконання дії')
      return
    }
    isSaved.value = false
    addToast('Рецепт видалено із збережених')
  } else {
    const { error } = await client
      .from('saved_recipes')
      .insert({ user_id: user.value.id, recipe_id: recipe.value.id })
    if (error) {
      addToast('Сталася помилка. Спробуйте ще раз')
      return
    }
    isSaved.value = true
    addToast('Рецепт збережено')
  }
}

const goEdit = () => {
  if (!recipe.value) return
  showActions.value = false
  router.push(`/recipes/${recipe.value.id}/edit`)
}

const toggleStatus = async () => {
  if (!recipe.value) return
  const next = !recipe.value.is_public
  const { error } = await client.from('recipes').update({ is_public: next }).eq('id', recipe.value.id)
  if (error) {
    addToast('Недостатньо прав для виконання дії')
    return
  }
  addToast('Статус рецепта змінено')
  showActions.value = false
  await load()
}

const deleteRecipe = async () => {
  if (!recipe.value) return
  const { error } = await client.from('recipes').delete().eq('id', recipe.value.id)
  showDeleteConfirm.value = false
  showActions.value = false
  if (error) {
    addToast('Недостатньо прав для виконання дії')
    return
  }
  addToast('Рецепт видалено')
  router.push('/my/recipes')
}
</script>
