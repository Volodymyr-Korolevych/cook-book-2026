export function useAuthRedirect() {
  const route = useRoute()
  const authMessage = computed(() => {
    const msg = route.query.msg
    return typeof msg === 'string' ? msg : ''
  })
  return { authMessage }
}
