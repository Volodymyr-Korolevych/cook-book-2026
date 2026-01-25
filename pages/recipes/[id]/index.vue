<template>
  <div v-if="loading" class="text-sm text-gray-600">Завантаження…</div>

  <div v-else-if="!recipe" class="text-sm text-gray-600">
    Рецепт не знайдено.
  </div>

  <div v-else class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: image + servings + ingredients -->
      <div class="space-y-4">
        <div class="rounded-3xl overflow-hidden bg-gray-100 aspect-[4/3]">
          <img
            v-if="recipe.main_image_url"
            :src="recipe.main_image_url"
            alt=""
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-500">
            Без зображення
          </div>
        </div>

        <div class="border border-gray-100 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold">Порції</div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50"
                @click="decServings"
                aria-label="Decrease servings"
              >
                –
              </button>
              <div class="min-w-[2.5rem] text-center text-sm font-semibold">
                {{ servings }}
              </div>
              <button
                type="button"
                class="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-50"
                @click="incServings"
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          </div>

          <div class="text-xs text-gray-600">
            Базові порції: {{ baseServings }}
          </div>
        </div>

        <div class="border border-gray-100 rounded-2xl p-4">
          <div class="font-semibold mb-3">Інгредієнти</div>
          <ul class="space-y-2">
            <li
              v-for="ing in scaledIngredients"
              :key="ing.id"
              class="flex items-baseline justify-between gap-4"
            >
              <div class="text-sm text-gray-900">
                {{ ing.name }}
              </div>
              <div class="text-sm text-gray-700 whitespace-nowrap">
                {{ formatQty(ing.scaled_quantity) }} {{ ing.unit }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right: title + meta + description + steps -->
      <div class="space-y-4">
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold">{{ recipe.title }}</h1>
          <div class="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
            <div>Автор: {{ recipe.author_name || '—' }}</div>
            <div v-if="recipe.cook_time_minutes">Час: {{ recipe.cook_time_minutes }} хв</div>
            <div>Статус: {{ recipe.is_public ? 'публічний' : 'приватний' }}</div>
          </div>
        </div>

        <div v-if="recipe.description" class="border border-gray-100 rounded-2xl p-4">
          <div class="font-semibold mb-2">Опис</div>
          <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ recipe.description }}</p>
        </div>

        <div class="border border-gray-100 rounded-2xl p-4 space-y-4">
          <div class="font-semibold">Кроки</div>

          <div v-for="st in sortedSteps" :key="st.id" class="space-y-2">
            <div class="text-sm font-semibold text-gray-800">
              Крок {{ st.step_number }}
            </div>
            <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ st.text }}</p>

            <div v-if="st.image_url" class="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
              <img :src="st.image_url" alt="" class="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="canSave"
            class="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            @click="onSave"
            type="button"
          >
            Зберегти в папці "Збережені рецепти"
          </button>

          <button
            v-if="isAuthor"
            class="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            @click="router.push(`/recipes/${recipe.id}/edit`)"
            type="button"
          >
            Редагувати
          </button>
        </div>

        <div v-if="message" class="text-sm text-gray-700">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

const id = route.params.id as string

const loading = ref(true)
const recipe = ref<any | null>(null)

const servings = ref<number>(2)
const message = ref<string>('')

const baseServings = computed(() => Number(recipe.value?.servings || 1))

const factor = computed(() => {
  const base = baseServings.value || 1
  return servings.value / base
})

const sortedSteps = computed(() => {
  const arr = (recipe.value?.recipe_steps || []) as any[]
  return [...arr].sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
})

const scaledIngredients = computed(() => {
  const arr = (recipe.value?.recipe_ingredients || []) as any[]
  const ordered = [...arr].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  return ordered.map((x) => ({
    id: x.id,
    name: x.name,
    unit: x.unit || '',
    scaled_quantity: Number(x.quantity) * factor.value
  }))
})

const formatQty = (n: number) => {
  // simple formatting: keep up to 2 decimals, trim trailing zeros
  const fixed = n.toFixed(2)
  return fixed.replace(/\.?0+$/, '')
}

const incServings = () => {
  if (servings.value < 50) servings.value += 1
}
const decServings = () => {
  if (servings.value > 1) servings.value -= 1
}

const isAuthor = computed(() => {
  return !!user.value && recipe.value?.author_id === user.value.id
})

const canSave = computed(() => {
  // guest: no save, author: no save button (optional)
  return !!user.value && !isAuthor.value
})

const load = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('recipes')
      .select(`
        id, title, description, main_image_url, cook_time_minutes, servings, season, is_public, author_id, created_at,
        recipe_ingredients(*),
        recipe_steps(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      recipe.value = null
      return
    }

    recipe.value = data
    servings.value = Number(data.servings || 2)

    // Try to fetch author display name if profiles table exists
    if (data.author_id) {
      const { data: prof } = await client.from('profiles').select('display_name').eq('id', data.author_id).maybeSingle()
      recipe.value.author_name = prof?.display_name || null
    }
  } catch {
    recipe.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)

const onSave = async () => {
  if (!user.value) return
  message.value = ''
  try {
    const { error } = await client.from('saved_recipes').insert({
      user_id: user.value.id,
      recipe_id: recipe.value.id
    })
    if (error) throw error
    message.value = 'Додано до збережених'
  } catch {
    message.value = 'Не вдалося зберегти рецепт'
  }
}
</script>
