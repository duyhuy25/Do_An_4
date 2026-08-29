export function formatPrice(v?: number) {
  if (v === undefined || v === null) return ''
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫'
}
