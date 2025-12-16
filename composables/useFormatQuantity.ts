// composables/useFormatQuantity.ts
export function useFormatQuantity() {
  const formatQuantity = (value: number) => {
    if (isNaN(value)) return ''
    const rounded = Math.round(value * 10) / 10 // 1 знак після коми
    if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
      return String(Math.round(rounded))
    }
    return String(rounded)
  }

  return { formatQuantity }
}
