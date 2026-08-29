import React, { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image?: string
  description?: string
}

export default function App(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(r => r.json() as Promise<Product[]>)
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  return (
    <div>
      <header style={{ background: '#ffcb05', padding: 20, textAlign: 'center' }}>
        <h1>Shop Đồ Chơi Trẻ Em Beo_Kid</h1>
      </header>

      <main className="grid" style={{ padding: 16 }}>
        {products.length === 0 && <p>Không có sản phẩm hoặc không thể kết nối backend.</p>}
        {products.map(p => (
          <div key={p.id} className="card">
            <img src={p.image || 'https://via.placeholder.com/300x180?text=Toy'} alt={p.name} />
            <h3>{p.name}</h3>
            <div className="price">{formatPrice(p.price)}</div>
            <p>{p.description}</p>
            <button className="btn">Thêm vào giỏ</button>
          </div>
        ))}
      </main>
    </div>
  )
}

function formatPrice(v?: number) {
  if (v === undefined || v === null) return ''
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫'
}
