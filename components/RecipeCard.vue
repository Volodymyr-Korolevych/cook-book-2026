<template>
    <div class="border rounded-xl overflow-hidden bg-white flex flex-col hover:shadow-sm transition">
        <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
            <img v-if="recipe.main_image_url" :src="recipe.main_image_url" :alt="recipe.title"
                class="w-full h-full object-cover" />
        </div>

        <div class="px-3 pt-3 pb-2 flex-1 flex flex-col gap-2">
            <h3 class="font-semibold line-clamp-2">
                {{ recipe.title }}
            </h3>

            <p class="text-xs text-gray-500">
                {{ recipeAuthor }}
            </p>

            <p v-if="recipe.cook_time_minutes" class="text-xs text-gray-500">
                Час: {{ recipe.cook_time_minutes }} хв
            </p>

            <div class="mt-auto flex items-center justify-between pt-1">
                <button type="button" class="text-xs text-gray-500 hover:text-gray-900" @click="openRecipe">
                    Відкрити
                </button>

                <!-- ДІЯ: ЗБЕРЕГТИ / МЕНЮ АВТОРА -->
                <div v-if="user">
                    <!-- чужий рецепт -->
                    <button v-if="!isAuthor" type="button"
                        class="text-xs border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
                        @click.stop="onSaveClick">
                        Зберегти
                    </button>

                    <!-- власний рецепт -->
                    <button v-else type="button"
                        class="text-xl leading-none px-2 py-1 text-gray-500 hover:text-gray-900"
                        @click.stop="$emit('openMenu', recipe)">
                        ⋮
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    recipe: any
}>()

const emit = defineEmits<{
    (e: 'openMenu', recipe: any): void
    (e: 'saveAsGuest'): void
    (e: 'toggleSave', recipe: any): void
}>()

const router = useRouter()
const user = useSupabaseUser()

const isAuthor = computed(
    () => user.value && props.recipe.author_id === user.value.id
)

const recipeAuthor = computed(() =>
    props.recipe.author_name || 'Автор невідомий'
)

const openRecipe = () => {
    router.push(`/recipes/${props.recipe.id}`)
}

const onSaveClick = () => {
    if (!user.value) {
        emit('saveAsGuest')
        return
    }
    emit('toggleSave', props.recipe)
}
</script>
