import React, { useEffect, useState } from 'react'
import { Product } from './types'
import Header from './components/Header'
import ProductList from './components/ProductList'
import SearchBar from './components/SearchBar'
import ReportForm from './components/ReportForm'

export default function App(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(r => r.json() as Promise<Product[]>)
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  function handleAdd(item: Product) {
    setProducts(prev => [item, ...prev])
  }

  const filtered = products.filter(p => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.location || '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <Header />

      <main style={{ padding: 16 }}>
        <ReportForm onAdd={handleAdd} />
        <SearchBar value={query} onChange={setQuery} />
        <ProductList products={filtered} />
      </main>
    </div>
  )
}
