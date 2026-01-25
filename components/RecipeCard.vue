<template>
  <NuxtLink
    :to="`/recipes/${recipe.id}`"
    class="group block rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-sm transition"
  >
    <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
      <img
        v-if="recipe.main_image_url"
        :src="recipe.main_image_url"
        alt=""
        class="w-full h-full object-cover group-hover:scale-[1.02] transition"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-500">
        Без зображення
      </div>
    </div>

    <div class="p-4 space-y-2">
      <div class="font-semibold leading-snug line-clamp-2">
        {{ recipe.title }}
      </div>

      <div class="text-xs text-gray-600 space-y-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Автор: {{ authorLabel }}</span>
          <span v-if="cookTime">• {{ cookTime }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span v-if="seasonText">Сезон: {{ seasonText }}</span>
          <span v-if="seasonText && dishTypeText">•</span>
          <span v-if="dishTypeText">Тип: {{ dishTypeText }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const SEASON_LABEL: Record<string, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Літо',
  autumn: 'Осінь'
}

const DISH_LABEL: Record<string, string> = {
  breakfast: 'Сніданок',
  lunch: 'Обід',
  dinner: 'Вечеря',
  dessert: 'Десерт'
}

// Simple author cache to avoid repeated per-card requests
const authorCache = (globalThis as any).__authorCache || ((globalThis as any).__authorCache = new Map<string, string>())

type Recipe = {
  id: string
  title: string
  main_image_url?: string | null
  cook_time_minutes?: number | null
  author_name?: string | null
  author_id?: string | null

  // new relations (if selected in query)
  recipe_seasons?: Array<{ season: string }>
  recipe_dish_types?: Array<{ dish_type: string }>

  // backward-compat (old single season)
  season?: string | null
}

const props = defineProps<{ recipe: Recipe }>()
const client = useSupabaseClient()

const cookTime = computed(() => {
  const n = props.recipe.cook_time_minutes
  return n ? `${n} хв` : ''
})

const seasons = computed<string[]>(() => {
  const rel = props.recipe.recipe_seasons?.map(x => x.season).filter(Boolean) ?? []
  if (rel.length) return Array.from(new Set(rel))

  // fallback: old single season
  const s = props.recipe.season
  return s ? [s] : []
})

const dishTypes = computed<string[]>(() => {
  const rel = props.recipe.recipe_dish_types?.map(x => x.dish_type).filter(Boolean) ?? []
  return Array.from(new Set(rel))
})

const seasonText = computed(() => seasons.value.map(s => SEASON_LABEL[s] || s).join(', '))
const dishTypeText = computed(() => dishTypes.value.map(t => DISH_LABEL[t] || t).join(', '))

const authorLabel = ref<string>('Автор')

const loadAuthor = async () => {
  const direct = props.recipe.author_name
  if (direct) {
    authorLabel.value = direct
    return
  }

  const id = props.recipe.author_id
  if (!id) return

  const cached = authorCache.get(id)
  if (cached) {
    authorLabel.value = cached
    return
  }

  const { data } = await client.from('profiles').select('display_name').eq('id', id).maybeSingle()
  const name = data?.display_name || 'Автор'
  authorCache.set(id, name)
  authorLabel.value = name
}

onMounted(loadAuthor)
watch(() => props.recipe.author_id, loadAuthor)
</script>
