// composables/useStorageUploads.ts
export function useStorageUploads() {
  const client = useSupabaseClient()

  const BUCKET = 'recipe-images'

  const getExt = (file: File) => {
    const name = file.name || ''
    const parts = name.split('.')
    const ext = parts.length > 1 ? parts.pop() : ''
    return (ext || 'jpg').toLowerCase()
  }

  const uploadFile = async (path: string, file: File) => {
    const { error } = await client.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || undefined
    })
    if (error) throw error

    const { data } = client.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const uploadMainImage = async (recipeId: string, file: File) => {
    const ext = getExt(file)
    const path = `recipes/${recipeId}/main.${ext}`
    return await uploadFile(path, file)
  }

  const uploadStepImage = async (recipeId: string, stepNumber: number, file: File) => {
    const ext = getExt(file)
    const path = `recipes/${recipeId}/steps/${stepNumber}.${ext}`
    return await uploadFile(path, file)
  }

  return { uploadMainImage, uploadStepImage }
}
