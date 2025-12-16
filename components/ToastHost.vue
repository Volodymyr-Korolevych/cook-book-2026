<template>
    <teleport to="body">
        <div class="fixed bottom-4 right-4 z-50 space-y-2">
            <div v-for="toast in toasts" :key="toast.id" class="px-4 py-2 rounded-lg shadow border bg-white text-sm">
                {{ toast.message }}
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
const { toasts } = useToasts()
</script>
