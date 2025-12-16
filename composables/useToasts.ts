// composables/useToasts.ts
type Toast = { id: number; message: string; timeout?: number }

const toastsState = ref<Toast[]>([])

export function useToasts() {
  const addToast = (message: string, timeout = 3000) => {
    const id = Date.now() + Math.random()
    toastsState.value.push({ id, message, timeout })
    setTimeout(() => {
      toastsState.value = toastsState.value.filter(t => t.id !== id)
    }, timeout)
  }

  return {
    toasts: toastsState,
    addToast
  }
}
