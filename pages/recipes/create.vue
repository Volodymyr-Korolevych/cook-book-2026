<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Створення рецепта</h1>

    <form class="space-y-6" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium">Назва</label>
            <input v-model="form.title" type="text"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Наприклад: Борщ" />
            <p v-if="errors.title" class="text-xs text-red-600">{{ errors.title }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium">Опис</label>
            <textarea v-model="form.description" rows="4"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Коротка історія або опис рецепта" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium">Час (хв)</label>
              <input v-model.number="form.cook_time_minutes" type="number" min="1"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium">Порції (базові)</label>
              <input v-model.number="form.servings" type="number" min="1" max="50"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
              <p v-if="errors.servings" class="text-xs text-red-600">{{ errors.servings }}</p>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium">Сезон</label>
            <select v-model="form.season"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="winter">winter</option>
              <option value="spring">spring</option>
              <option value="summer">summer</option>
              <option value="autumn">autumn</option>
            </select>
            <p v-if="errors.season" class="text-xs text-red-600">{{ errors.season }}</p>
          </div>

          <div class="flex items-center gap-2">
            <input id="public" v-model="form.is_public" type="checkbox" class="h-4 w-4" />
            <label for="public" class="text-sm">Публічний рецепт</label>
          </div>
        </div>

        <div class="space-y-6">
          <div class="border rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Інгредієнти</h2>
              <button type="button"
                class="text-sm border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50"
                @click="addIngredient">
                Додати
              </button>
            </div>

            <p v-if="errors.ingredients" class="text-xs text-red-600">{{ errors.ingredients }}</p>

            <div v-for="(ing, idx) in form.ingredients" :key="ing._key" class="grid grid-cols-12 gap-2 items-start">
              <div class="col-span-12 sm:col-span-6">
                <input v-model="ing.name" type="text"
                  class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="Назва" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <input v-model.number="ing.quantity" type="number" min="0" step="0.01"
                  class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="К-сть" />
              </div>

              <div class="col-span-5 sm:col-span-2">
                <input v-model="ing.unit" type="text"
                  class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                  placeholder="Одиниця" />
              </div>

              <div class="col-span-1 flex justify-end">
                <button type="button" class="text-gray-500 hover:text-gray-900" @click="removeIngredient(idx)">✕</button>
              </div>

              <div class="col-span-12">
                <p v-if="ingredientErrors[idx]" class="text-xs text-red-600">{{ ingredientErrors[idx] }}</p>
              </div>
            </div>
          </div>

          <div class="border rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Кроки</h2>
              <button type="button"
                class="text-sm border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50"
                @click="addStep">
                Додати
              </button>
            </div>

            <p v-if="errors.steps" class="text-xs text-red-600">{{ errors.steps }}</p>

            <div v-for="(st, idx) in form.steps" :key="st._key" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-gray-700">Крок {{ idx + 1 }}</div>
                <button type="button" class="text-gray-500 hover:text-gray-900 text-sm" @click="removeStep(idx)">✕</button>
              </div>

              <textarea v-model="st.text" rows="3" class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Опис кроку" />
              <p v-if="stepErrors[idx]" class="text-xs text-red-600">{{ stepErrors[idx] }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="formError" class="border rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-800">
        {{ formError }}
      </div>

      <div class="flex justify-end">
        <button type="submit"
          class="rounded-full bg-primary text-white px-6 py-2 text-sm hover:bg-orange-500 transition"
          :disabled="loading">
          {{ loading ? 'Збереження…' : 'Опублікувати' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()
const { addToast } = useToasts()

const loading = ref(false)
const formError = ref('')

const form = reactive({
  title: '',
  description: '',
  main_image_url: '',
  cook_time_minutes: null as number | null,
  servings: 2,
  season: 'winter',
  is_public: true,
  ingredients: [] as any[],
  steps: [] as any[]
})

const errors = reactive<{ [k: string]: string | undefined }>({})
const ingredientErrors = ref<string[]>([])
const stepErrors = ref<string[]>([])

const makeKey = () => `${Date.now()}-${Math.random()}`

const addIngredient = () => form.ingredients.push({ _key: makeKey(), name: '', quantity: 0, unit: '' })
const removeIngredient = (idx: number) => form.ingredients.splice(idx, 1)

const addStep = () => form.steps.push({ _key: makeKey(), text: '', image_url: '' })
const removeStep = (idx: number) => form.steps.splice(idx, 1)

onMounted(() => {
  addIngredient()
  addStep()
})

const validate = () => {
  for (const k of Object.keys(errors)) errors[k] = undefined
  ingredientErrors.value = []
  stepErrors.value = []
  formError.value = ''

  const t = form.title.trim()
  if (!t) errors.title = 'Вкажіть назву рецепта'
  else if (t.length < 3) errors.title = 'Назва має містити щонайменше 3 символи'
  else if (t.length > 100) errors.title = 'Назва має бути не довше 100 символів'

  if (!form.servings || form.servings < 1 || form.servings > 50) errors.servings = 'Кількість порцій має бути числом від 1 до 50'
  if (!form.season) errors.season = 'Оберіть сезон'

  if (!form.ingredients.length) {
    errors.ingredients = 'Додайте щонайменше один інгредієнт'
  } else {
    form.ingredients.forEach((ing, idx) => {
      const nameOk = (ing.name || '').trim().length >= 2
      const qtyOk = typeof ing.quantity === 'number' && ing.quantity > 0
      const unitOk = (ing.unit || '').trim().length >= 1
      let msg = ''
      if (!nameOk) msg = 'Заповніть назву інгредієнта'
      else if (!qtyOk) msg = 'Кількість інгредієнта має бути більшою за 0'
      else if (!unitOk) msg = 'Одиниця виміру обов’язкова'
      ingredientErrors.value[idx] = msg
    })
  }

  if (!form.steps.length) {
    errors.steps = 'Додайте щонайменше один крок приготування'
  } else {
    form.steps.forEach((st, idx) => {
      const ok = (st.text || '').trim().length >= 5
      stepErrors.value[idx] = ok ? '' : 'Опис кроку має містити щонайменше 5 символів'
    })
  }

  return !Object.values(errors).some(Boolean) && ingredientErrors.value.every(x => !x) && stepErrors.value.every(x => !x)
}

const onSubmit = async () => {
  if (!user.value) return
  if (!validate()) return

  loading.value = true
  try {
    const { data: recipe, error: recipeErr } = await client
      .from('recipes')
      .insert({
        author_id: user.value.id,
        title: form.title.trim(),
        description: form.description.trim(),
        main_image_url: form.main_image_url || null,
        cook_time_minutes: form.cook_time_minutes,
        servings: form.servings,
        season: form.season,
        is_public: form.is_public
      })
      .select('*')
      .single()

    if (recipeErr) throw recipeErr

    const ingredientsPayload = form.ingredients.map((ing, idx) => ({
      recipe_id: recipe.id,
      name: (ing.name || '').trim(),
      quantity: ing.quantity,
      unit: (ing.unit || '').trim(),
      order_index: idx + 1
    }))
    const { error: ingErr } = await client.from('recipe_ingredients').insert(ingredientsPayload)
    if (ingErr) throw ingErr

    const stepsPayload = form.steps.map((st, idx) => ({
      recipe_id: recipe.id,
      step_number: idx + 1,
      text: (st.text || '').trim(),
      image_url: st.image_url || null
    }))
    const { error: stErr } = await client.from('recipe_steps').insert(stepsPayload)
    if (stErr) throw stErr

    addToast('Рецепт успішно збережено')
    router.push(`/recipes/${recipe.id}`)
  } catch {
    formError.value = 'Сталася помилка. Спробуйте ще раз'
  } finally {
    loading.value = false
  }
}
</script>
