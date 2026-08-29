import React, { useEffect, useState } from 'react'
import { Product } from './types'
import Header from './components/Header'
import ProductList from './components/ProductList'

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
      <Header />

      <main style={{ padding: 16 }}>
        <ProductList products={products} />
      </main>
    </div>
  )
}
