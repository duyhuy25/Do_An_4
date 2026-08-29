export interface Product {
  id: number
  name: string
  // price is not required for lost items; keep for backwards-compatibility
  price?: number
  image?: string
  description?: string
  location?: string
  contact?: string
  reportedAt?: string
}
