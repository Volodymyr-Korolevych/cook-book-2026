<template>
  <button
    @click="goBack"
    class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 pt-4"
  >
    ← Назад до рецептів
  </button>
</template>

<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
