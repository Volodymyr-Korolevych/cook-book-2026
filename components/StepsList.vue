<template>
    <ol class="space-y-4 list-decimal list-inside">
        <li v-for="step in steps" :key="step.id" class="space-y-2">
            <div class="text-sm text-gray-800 whitespace-pre-line">
                {{ step.text }}
            </div>
            <div v-if="step.image_url" class="rounded-lg overflow-hidden bg-gray-100">
                <img :src="step.image_url" alt="" class="w-full h-auto object-cover" />
            </div>
        </li>
    </ol>
</template>

<script setup lang="ts">
defineProps<{
    steps: any[]
}>()
</script>
