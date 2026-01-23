<template>
  <div class="min-h-screen bg-white text-gray-900">
    <HeaderBar />

    <main class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// компонент HeaderBar буде авто-імпортований з /components
</script>
