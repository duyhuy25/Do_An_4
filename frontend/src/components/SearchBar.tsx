import React from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props): JSX.Element {
  return (
    <div style={{ marginBottom: 12 }}>
      <input
        aria-label="search"
        placeholder="Tìm theo tên, mô tả, vị trí..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: 8, fontSize: 16 }}
      />
    </div>
  )
}
