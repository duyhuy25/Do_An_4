import React from 'react'
import { Product } from '../types'
import { formatPrice } from '../utils'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props): JSX.Element {
  return (
    <div className="card">
      <img src={product.image || 'https://via.placeholder.com/300x180?text=Lost+Item'} alt={product.name} />
      <h3>{product.name}</h3>
      {product.location && <div className="muted">Vị trí: {product.location}</div>}
      {product.contact && <div className="muted">Liên hệ: {product.contact}</div>}
      <p>{product.description}</p>
      <button className="btn">Đã tìm thấy / Liên hệ</button>
    </div>
  )
}
