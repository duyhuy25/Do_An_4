import React from 'react'
import { Product } from '../types'
import { formatPrice } from '../utils'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props): JSX.Element {
  return (
    <div className="card">
      <img src={product.image || 'https://via.placeholder.com/300x180?text=Toy'} alt={product.name} />
      <h3>{product.name}</h3>
      <div className="price">{formatPrice(product.price)}</div>
      <p>{product.description}</p>
      <button className="btn">Thêm vào giỏ</button>
    </div>
  )
}
