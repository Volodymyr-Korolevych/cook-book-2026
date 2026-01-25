<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Результати пошуку</h1>

    <p v-if="loaded && !recipes.length" class="text-sm text-gray-500">
      Нічого не знайдено за запитом «{{ q }}».
    </p>

    <RecipeGrid
      v-else-if="recipes.length"
      :recipes="recipes"
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

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()

const q = computed(() => (route.query.q as string) || '')

const recipes = ref<any[]>([])
const loaded = ref(false)
const showGuestModal = ref(false)

const SEASON_KEYWORDS: Record<string, string> = {
  'зима': 'winter',
  'весна': 'spring',
  'літо': 'summer',
  'осінь': 'autumn'
}

const DISH_KEYWORDS: Record<string, string> = {
  'сніданок': 'breakfast',
  'обід': 'lunch',
  'вечеря': 'dinner',
  'десерт': 'dessert'
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'`]/g, "'")
    .replace(/[^a-zа-яіїєґ0-9\s'-]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parseQuery = (raw: string) => {
  const text = normalize(raw)
  const tokens = text ? text.split(' ') : []

  const seasons = new Set<string>()
  const dishTypes = new Set<string>()
  const other: string[] = []

  for (const t of tokens) {
    if (SEASON_KEYWORDS[t]) seasons.add(SEASON_KEYWORDS[t])
    else if (DISH_KEYWORDS[t]) dishTypes.add(DISH_KEYWORDS[t])
    else other.push(t)
  }

  return {
    seasons: Array.from(seasons),
    dishTypes: Array.from(dishTypes),
    otherTerms: other.filter(Boolean)
  }
}

const fetchRecipeIdsByText = async (terms: string[]) => {
  if (!terms.length) return new Set<string>()

  const likeClauses = terms.flatMap(t => [
    `title.ilike.%${t}%`,
    `description.ilike.%${t}%`
  ])

  const { data, error } = await client
    .from('recipes')
    .select('id')
    .eq('is_public', true)
    .or(likeClauses.join(','))

  if (error) return new Set<string>()
  return new Set((data || []).map((x: any) => x.id))
}

const fetchRecipeIdsByIngredients = async (terms: string[]) => {
  if (!terms.length) return new Set<string>()

  const likeClauses = terms.map(t => `name.ilike.%${t}%`)
  const { data, error } = await client
    .from('recipe_ingredients')
    .select('recipe_id')
    .or(likeClauses.join(','))

  if (error) return new Set<string>()
  return new Set((data || []).map((x: any) => x.recipe_id))
}

const fetchRecipesByIds = async (ids: string[]) => {
  if (!ids.length) return []

  const { data, error } = await client
    .from('recipes')
    .select(`
      id, title, description, main_image_url, cook_time_minutes, servings, is_public, author_id, created_at,
      recipe_seasons(season),
      recipe_dish_types(dish_type)
    `)
    .in('id', ids)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

const applyRelationFilters = (rows: any[], seasons: string[], dishTypes: string[]) => {
  return rows.filter(r => {
    const rSeasons = (r.recipe_seasons || []).map((x: any) => x.season)
    const rTypes = (r.recipe_dish_types || []).map((x: any) => x.dish_type)

    const seasonOk = seasons.length ? seasons.some(s => rSeasons.includes(s)) : true
    const typeOk = dishTypes.length ? dishTypes.some(t => rTypes.includes(t)) : true

    return seasonOk && typeOk
  })
}

const runSearch = async (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const { seasons, dishTypes, otherTerms } = parseQuery(trimmed)

  // 1) Candidate IDs from "other terms" (OR logic): title/description OR ingredients
  let ids = new Set<string>()

  if (otherTerms.length) {
    const [a, b] = await Promise.all([
      fetchRecipeIdsByText(otherTerms),
      fetchRecipeIdsByIngredients(otherTerms)
    ])
    for (const id of a) ids.add(id)
    for (const id of b) ids.add(id)
  } else {
    // Якщо введені лише ключові слова (сезон/тип), беремо "всі публічні" як базу і потім відфільтруємо
    const { data } = await client.from('recipes').select('id').eq('is_public', true)
    ;(data || []).forEach((x: any) => ids.add(x.id))
  }

  const rows = await fetchRecipesByIds(Array.from(ids))
  return applyRelationFilters(rows, seasons, dishTypes)
}

watch(
  q,
  async (value) => {
    loaded.value = false
    recipes.value = []
    recipes.value = await runSearch(value || '')
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
