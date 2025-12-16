<template>
    <teleport to="body">
        <transition name="fade">
            <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
                    <h2 class="text-lg font-semibold mb-3">
                        {{ title }}
                    </h2>

                    <p v-if="message" class="text-sm text-gray-700 mb-4">
                        {{ message }}
                    </p>

                    <div class="flex justify-end gap-2 mt-2">
                        <button v-if="cancelText" type="button"
                            class="px-4 py-1.5 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
                            @click="$emit('cancel')">
                            {{ cancelText }}
                        </button>
                        <button v-if="confirmText" type="button"
                            class="px-4 py-1.5 rounded-full bg-primary text-white text-sm hover:bg-orange-500"
                            @click="$emit('confirm')">
                            {{ confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
defineProps<{
    modelValue: boolean
    title: string
    message?: string
    cancelText?: string
    confirmText?: string
}>()

defineEmits<{
    (e: 'cancel'): void
    (e: 'confirm'): void
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
