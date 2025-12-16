<template>
    <div class="flex items-center gap-3">
        <span class="text-sm text-gray-700">Порції:</span>
        <button type="button"
            class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
            @click="update(-1)">
            −
        </button>
        <span class="w-8 text-center text-sm font-medium">
            {{ currentServings }}
        </span>
        <button type="button"
            class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
            @click="update(1)">
            +
        </button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    currentServings: number
    min?: number
    max?: number
}>()

const emit = defineEmits<{
    (e: 'update:servings', value: number): void
}>()

const update = (delta: number) => {
    const min = props.min ?? 1
    const max = props.max ?? 50
    let next = props.currentServings + delta
    if (next < min) next = min
    if (next > max) next = max
    emit('update:servings', next)
}
</script>
