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

      <div class="flex items-center justify-between text-xs text-gray-600">
        <div class="truncate">
          {{ authorLabel }}
        </div>
        <div v-if="recipe.cook_time_minutes" class="shrink-0">
          {{ recipe.cook_time_minutes }} хв
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
type Recipe = {
  id: string
  title: string
  main_image_url?: string | null
  cook_time_minutes?: number | null
  author_name?: string | null
  author_id?: string | null
}

const props = defineProps<{
  recipe: Recipe
}>()

const authorLabel = computed(() => {
  return props.recipe.author_name || 'Автор'
})
</script>
