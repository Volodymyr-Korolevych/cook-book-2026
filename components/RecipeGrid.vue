<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RecipeCard v-for="r in recipes" :key="r.id" :recipe="r" @openMenu="$emit('openMenu', $event)"
            @saveAsGuest="$emit('saveAsGuest')" @toggleSave="$emit('toggleSave', $event)" />
    </div>
</template>

<script setup lang="ts">
import RecipeCard from './RecipeCard.vue'

defineProps<{
    recipes: any[]
}>()

defineEmits<{
    (e: 'openMenu', recipe: any): void
    (e: 'saveAsGuest'): void
    (e: 'toggleSave', recipe: any): void
}>()
</script>
