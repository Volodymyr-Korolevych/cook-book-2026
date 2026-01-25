<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Створення рецепта</h1>

    <form class="space-y-6" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left -->
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium">Назва</label>
            <input
              v-model="form.title"
              type="text"
              autocomplete="off"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Наприклад: Борщ"
            />
            <p v-if="errors.title" class="text-xs text-red-600">{{ errors.title }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium">Опис</label>
            <textarea
              v-model="form.description"
              rows="5"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Коротко опишіть рецепт"
            />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium">Головне фото</label>
            <input type="file" accept="image/*" class="block w-full text-sm" @change="onMainImageChange" />
            <p v-if="errors.mainImage" class="text-xs text-red-600">{{ errors.mainImage }}</p>

            <div v-if="mainPreviewUrl" class="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img :src="mainPreviewUrl" alt="" class="w-full h-full object-cover" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium">Час (хв)</label>
              <input
                v-model.number="form.cook_time_minutes"
                type="number"
                min="1"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p v-if="errors.cook_time_minutes" class="text-xs text-red-600">{{ errors.cook_time_minutes }}</p>
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium">Порції (базово)</label>
              <input
                v-model.number="form.servings"
                type="number"
                min="1"
                class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p v-if="errors.servings" class="text-xs text-red-600">{{ errors.servings }}</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium">Сезонність (можна кілька)</div>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="s in SEASONS" :key="s.value" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="s.value" v-model="selectedSeasons" />
                <span>{{ s.label }}</span>
              </label>
            </div>
            <p v-if="errors.seasons" class="text-xs text-red-600">{{ errors.seasons }}</p>
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium">Тип страви (можна кілька)</div>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="t in DISH_TYPES" :key="t.value" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :value="t.value" v-model="selectedDishTypes" />
                <span>{{ t.label }}</span>
              </label>
            </div>
            <p v-if="errors.dishTypes" class="text-xs text-red-600">{{ errors.dishTypes }}</p>
          </div>

          <div class="flex items-center gap-2">
            <input id="isPublic" v-model="form.is_public" type="checkbox" />
            <label for="isPublic" class="text-sm">Публічний рецепт</label>
          </div>
        </div>

        <!-- Right -->
        <div class="space-y-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="font-semibold">Інгредієнти</div>
              <button type="button" class="text-sm underline" @click="addIngredient">Додати</button>
            </div>

            <div v-for="(ing, idx) in ingredients" :key="idx" class="grid grid-cols-12 gap-2">
              <input v-model="ing.name" class="col-span-6 border rounded-xl px-3 py-2 text-sm" placeholder="Назва" />
              <input v-model.number="ing.quantity" type="number" step="0.01" class="col-span-3 border rounded-xl px-3 py-2 text-sm" placeholder="К-сть" />
              <input v-model="ing.unit" class="col-span-2 border rounded-xl px-3 py-2 text-sm" placeholder="Од." />
              <button type="button" class="col-span-1 text-sm" @click="removeIngredient(idx)">✕</button>
            </div>

            <p v-if="errors.ingredients" class="text-xs text-red-600">{{ errors.ingredients }}</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="font-semibold">Кроки</div>
              <button type="button" class="text-sm underline" @click="addStep">Додати</button>
            </div>

            <div v-for="(st, idx) in steps" :key="idx" class="border rounded-2xl p-4 space-y-2">
              <div class="text-sm font-semibold">Крок {{ idx + 1 }}</div>

              <textarea v-model="st.text" rows="3" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Опис кроку" />

              <input type="file" accept="image/*" class="block w-full text-sm" @change="(e) => onStepImageChange(idx, e)" />

              <div v-if="st.previewUrl" class="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                <img :src="st.previewUrl" alt="" class="w-full h-full object-cover" />
              </div>

              <button type="button" class="text-sm underline" @click="removeStep(idx)">Видалити крок</button>
            </div>

            <p v-if="errors.steps" class="text-xs text-red-600">{{ errors.steps }}</p>
          </div>
        </div>
      </div>

      <div v-if="formError" class="border rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-800">
        {{ formError }}
      </div>

      <button
        type="submit"
        class="rounded-full bg-primary text-white px-6 py-2 text-sm hover:bg-orange-500 transition"
        :disabled="saving"
      >
        {{ saving ? 'Збереження…' : 'Зберегти' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

const SEASONS = [
  { value: 'winter', label: 'Зима' },
  { value: 'spring', label: 'Весна' },
  { value: 'summer', label: 'Літо' },
  { value: 'autumn', label: 'Осінь' }
] as const

const DISH_TYPES = [
  { value: 'breakfast', label: 'Сніданок' },
  { value: 'lunch', label: 'Обід' },
  { value: 'dinner', label: 'Вечеря' },
  { value: 'dessert', label: 'Десерт' }
] as const

const form = reactive({
  title: '',
  description: '',
  cook_time_minutes: 30,
  servings: 2,
  is_public: true
})

const selectedSeasons = ref<string[]>([])
const selectedDishTypes = ref<string[]>([])

const mainImageFile = ref<File | null>(null)
const mainPreviewUrl = ref<string>('')

const ingredients = ref<Array<{ name: string; quantity: number | null; unit: string }>>([])
const steps = ref<Array<{ text: string; file: File | null; previewUrl: string }>>([])

const saving = ref(false)
const formError = ref('')

const errors = reactive<Record<string, string | undefined>>({})

const resetErrors = () => {
  Object.keys(errors).forEach(k => (errors[k] = undefined))
  formError.value = ''
}

const addIngredient = () => ingredients.value.push({ name: '', quantity: null, unit: '' })
const removeIngredient = (idx: number) => ingredients.value.splice(idx, 1)

const addStep = () => steps.value.push({ text: '', file: null, previewUrl: '' })
const removeStep = (idx: number) => steps.value.splice(idx, 1)

onMounted(() => {
  addIngredient()
  addStep()
})

const onMainImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  mainImageFile.value = file
  mainPreviewUrl.value = file ? URL.createObjectURL(file) : ''
}

const onStepImageChange = (idx: number, e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  steps.value[idx].file = file
  steps.value[idx].previewUrl = file ? URL.createObjectURL(file) : ''
}

const validate = () => {
  resetErrors()

  if (!form.title.trim()) errors.title = 'Вкажіть назву'
  if (!form.cook_time_minutes || form.cook_time_minutes < 1) errors.cook_time_minutes = 'Вкажіть час приготування'
  if (!form.servings || form.servings < 1) errors.servings = 'Вкажіть базові порції'

  if (!selectedSeasons.value.length) errors.seasons = 'Оберіть хоча б один сезон'
  if (!selectedDishTypes.value.length) errors.dishTypes = 'Оберіть хоча б один тип страви'

  const validIngs = ingredients.value.filter(i => i.name.trim())
  if (!validIngs.length) errors.ingredients = 'Додайте хоча б 1 інгредієнт'

  const validSteps = steps.value.filter(s => s.text.trim())
  if (!validSteps.length) errors.steps = 'Додайте хоча б 1 крок'

  return Object.values(errors).every(v => !v)
}

const uploadImage = async (path: string, file: File) => {
  const { error } = await client.storage.from('recipe-images').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = client.storage.from('recipe-images').getPublicUrl(path)
  return data.publicUrl
}

const onSubmit = async () => {
  if (!user.value) return
  if (!validate()) return

  saving.value = true
  try {
    // 1) create recipe first (no image yet)
    const { data: rec, error: recErr } = await client
      .from('recipes')
      .insert({
        author_id: user.value.id,
        title: form.title.trim(),
        description: form.description.trim(),
        cook_time_minutes: form.cook_time_minutes,
        servings: form.servings,
        is_public: form.is_public,
        // backward compat: store first selected season (optional)
        season: selectedSeasons.value[0] || null,
        main_image_url: null
      })
      .select('id')
      .single()

    if (recErr) throw recErr
    const recipeId = rec.id as string

    // 2) upload main image
    if (mainImageFile.value) {
      const ext = mainImageFile.value.name.split('.').pop() || 'jpg'
      const url = await uploadImage(`recipes/${recipeId}/main.${ext}`, mainImageFile.value)
      const { error } = await client.from('recipes').update({ main_image_url: url }).eq('id', recipeId)
      if (error) throw error
    }

    // 3) insert ingredients
    const ingRows = ingredients.value
      .filter(i => i.name.trim())
      .map((i, idx) => ({
        recipe_id: recipeId,
        name: i.name.trim(),
        quantity: i.quantity ?? 0,
        unit: (i.unit || '').trim(),
        order_index: idx
      }))

    const { error: ingErr } = await client.from('recipe_ingredients').insert(ingRows)
    if (ingErr) throw ingErr

    // 4) insert steps (first without images)
    const stepRows = steps.value
      .filter(s => s.text.trim())
      .map((s, idx) => ({
        recipe_id: recipeId,
        step_number: idx + 1,
        text: s.text.trim(),
        image_url: null
      }))

    const { data: insertedSteps, error: stErr } = await client
      .from('recipe_steps')
      .insert(stepRows)
      .select('id, step_number')

    if (stErr) throw stErr

    // 5) upload step images and patch URLs
    for (let idx = 0; idx < steps.value.length; idx++) {
      const file = steps.value[idx].file
      if (!file) continue

      const stepNumber = idx + 1
      const stepRow = (insertedSteps || []).find((x: any) => x.step_number === stepNumber)
      if (!stepRow) continue

      const ext = file.name.split('.').pop() || 'jpg'
      const url = await uploadImage(`recipes/${recipeId}/steps/${stepRow.id}.${ext}`, file)
      const { error } = await client.from('recipe_steps').update({ image_url: url }).eq('id', stepRow.id)
      if (error) throw error
    }

    // 6) seasons + dish types
    const { error: sErr } = await client
      .from('recipe_seasons')
      .insert(selectedSeasons.value.map(season => ({ recipe_id: recipeId, season })))
    if (sErr) throw sErr

    const { error: dErr } = await client
      .from('recipe_dish_types')
      .insert(selectedDishTypes.value.map(dish_type => ({ recipe_id: recipeId, dish_type })))
    if (dErr) throw dErr

    // done
    await router.push(`/recipes/${recipeId}`)
  } catch (e: any) {
    formError.value = String(e?.message || 'Не вдалося зберегти рецепт')
  } finally {
    saving.value = false
  }
}
</script>
