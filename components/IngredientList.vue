<template>
    <ul class="space-y-1">
        <li v-for="ing in formatted" :key="ing.id" class="text-sm text-gray-800">
            <span class="font-medium">
                {{ ing.displayQuantity }}
                <span v-if="ing.unit">&nbsp;{{ ing.unit }}</span>
            </span>
            &nbsp;{{ ing.name }}
        </li>
    </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
    ingredients: any[]
    baseServings: number
    currentServings: number
}>()

const { formatQuantity } = useFormatQuantity()

const formatted = computed(() => {
    const factor = props.currentServings / props.baseServings
    return props.ingredients.map((ing: any) => {
        const raw = (ing.quantity || 0) * factor
        return {
            ...ing,
            displayQuantity: formatQuantity(raw)
        }
    })
})
</script>
