// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  app: {
    head: {
      title: 'Кулінарні рецепти',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  
  supabase: {
    // keys will come from .env
    redirect: false
  }
,
  devtools: { enabled: true },
  compatibilityDate: '2025-12-17'
})