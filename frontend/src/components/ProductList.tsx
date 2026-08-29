import React from 'react'
import { Product } from '../types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
}

export default function ProductList({ products }: Props): JSX.Element {
  if (!products || products.length === 0) {
    return <p>Không có sản phẩm hoặc không thể kết nối backend.</p>
  }

  return (
    <div className="grid">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
