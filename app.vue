<template>
    <div class="min-h-screen flex flex-col bg-white text-gray-900">
        <HeaderBar />
        <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6">
            <NuxtPage />
        </main>
        <ToastHost />
    </div>
</template>

<script setup lang="ts">
import HeaderBar from '~/components/HeaderBar.vue'
import ToastHost from '~/components/ToastHost.vue'
</script>
