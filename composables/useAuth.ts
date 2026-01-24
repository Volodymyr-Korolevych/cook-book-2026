// composables/useAuth.ts
type FriendlyAuthError = {
  message: string
  raw?: unknown
}

const normalizeAuthError = (err: any): FriendlyAuthError => {
  const msg = String(err?.message || '')

  // Supabase часто повертає англомовні повідомлення — мапимо на зрозумілі українські
  if (/invalid login credentials/i.test(msg)) {
    return { message: 'Неправильний email або пароль', raw: err }
  }

  if (/email not confirmed/i.test(msg)) {
    return { message: 'Email не підтверджено. Перевірте пошту та підтвердіть адресу', raw: err }
  }

  if (/user already registered|already registered/i.test(msg)) {
    return { message: 'Цей email вже зареєстрований. Спробуйте увійти', raw: err }
  }

  if (/password should be at least|weak password/i.test(msg)) {
    return { message: 'Пароль має містити щонайменше 6 символів', raw: err }
  }

  if (/unable to validate email address|invalid email/i.test(msg)) {
    return { message: 'Вкажіть коректний email', raw: err }
  }

  if (/email rate limit exceeded|rate limit/i.test(msg)) {
    return { message: 'Забагато спроб. Спробуйте трохи пізніше', raw: err }
  }

  if (/signup is disabled/i.test(msg)) {
    return { message: 'Реєстрація тимчасово вимкнена', raw: err }
  }

  if (/database error saving new user/i.test(msg)) {
    return { message: 'Не вдалося створити акаунт (помилка сервера). Спробуйте пізніше', raw: err }
  }

  // RLS типова для profiles insert
  if (/row-level security|violates row-level security/i.test(msg)) {
    return { message: 'Операцію заблоковано правилами доступу (RLS). Перевірте політики Supabase', raw: err }
  }

  // fallback
  return { message: 'Сталася помилка. Спробуйте ще раз', raw: err }
}

export function useAuth() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const { addToast } = useToasts()

  const signIn = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      const fe = normalizeAuthError(error)
      addToast(fe.message)
      throw new Error(fe.message)
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await client.auth.signUp({ email, password })

    if (error) {
      const fe = normalizeAuthError(error)
      addToast(fe.message)
      throw new Error(fe.message)
    }

    // створення профілю (може впасти через RLS — тоді покажемо окреме зрозуміле повідомлення)
    if (data.user) {
      const { error: профErr } = await client.from('profiles').insert({
        id: data.user.id,
        display_name: displayName
      })

      if (профErr) {
        const fe = normalizeAuthError(профErr)
        // акаунт вже створено, але профіль не вставився
        addToast('Акаунт створено, але профіль не збережено')
        throw new Error(`Акаунт створено, але профіль не збережено. ${fe.message}`)
      }
    }
  }

  const signOut = async () => {
    await client.auth.signOut()
  }

  return { user, signIn, signUp, signOut }
}
