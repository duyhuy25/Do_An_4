import React, { useState } from 'react'
import { Product } from '../types'

interface Props {
  onAdd: (item: Product) => void
}

export default function ReportForm({ onAdd }: Props): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    const item: Product = {
      id: Date.now(),
      name,
      description,
      location,
      contact,
      reportedAt: new Date().toISOString(),
    }
    onAdd(item)
    setName('')
    setDescription('')
    setLocation('')
    setContact('')
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <h3>Báo cáo đồ thất lạc</h3>
      <input placeholder="Tên đồ" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <input placeholder="Vị trí (ví dụ: Thư viện tầng 2)" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <input placeholder="Liên hệ (số điện thoại / email)" value={contact} onChange={e => setContact(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <textarea placeholder="Mô tả" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <button type="submit" className="btn">Gửi báo cáo</button>
    </form>
  )
}
