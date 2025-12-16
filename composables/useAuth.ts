// composables/useAuth.ts
export function useAuth() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const { addToast } = useToasts()

  const signIn = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      addToast('Неправильний email або пароль')
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await client.auth.signUp({
      email,
      password
    })
    if (error) {
      addToast('Помилка реєстрації')
      throw error
    }

    // створення профілю
    if (data.user) {
      await client.from('profiles').insert({
        id: data.user.id,
        display_name: displayName
      })
    }
  }

  const signOut = async () => {
    await client.auth.signOut()
  }

  return {
    user,
    signIn,
    signUp,
    signOut
  }
}
