// composables/useRecipes.ts
export function useRecipes() {
  const client = useSupabaseClient()

  const recipeSelect = `
    id,
    author_id,
    title,
    description,
    main_image_url,
    cook_time_minutes,
    servings,
    is_public,
    created_at,
    updated_at,
    recipe_seasons(season),
    recipe_dish_types(dish_type)
  `

  const recipeFullSelect = `
    id,
    author_id,
    title,
    description,
    main_image_url,
    cook_time_minutes,
    servings,
    is_public,
    created_at,
    updated_at,
    recipe_ingredients(*),
    recipe_steps(*),
    recipe_seasons(season),
    recipe_dish_types(dish_type)
  `

  const getSeasonalRecipes = async () => {
    const month = new Date().getMonth() + 1
    const season =
      month === 12 || month <= 2
        ? 'winter'
        : month <= 5
          ? 'spring'
          : month <= 8
            ? 'summer'
            : 'autumn'

    const { data, error } = await client
      .from('recipes')
      .select(`
        id,
        author_id,
        title,
        description,
        main_image_url,
        cook_time_minutes,
        servings,
        is_public,
        created_at,
        updated_at,
        recipe_seasons!inner(season),
        recipe_dish_types(dish_type)
      `)
      .eq('is_public', true)
      .eq('recipe_seasons.season', season)
      .limit(8)

    if (error) throw error
    return data || []
  }

  const getLatestRecipes = async () => {
    const { data, error } = await client
      .from('recipes')
      .select(recipeSelect)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) throw error
    return data || []
  }

  const getRecipeById = async (id: string) => {
    const { data, error } = await client
      .from('recipes')
      .select(recipeFullSelect)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  }

  const searchRecipes = async (q: string) => {
    const { data, error } = await client
      .from('recipes')
      .select(recipeSelect)
      .eq('is_public', true)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)

    if (error) throw error
    return data || []
  }

  return {
    getSeasonalRecipes,
    getLatestRecipes,
    getRecipeById,
    searchRecipes
  }
}