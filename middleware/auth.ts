export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo({ path: '/auth', query: { msg: 'Будь ласка, увійдіть у свій акаунт' } })
  }
})
