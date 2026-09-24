import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

export function ImagePicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  return <div className="image-picker">
    <input ref={inputRef} className="image-picker-input" type="file" accept="image/*" multiple
      onChange={(event) => {
        const chosen = Array.from(event.target.files || []);
        onChange([...files, ...chosen.slice(0, Math.max(0, 10 - files.length))]);
        event.target.value = '';
      }} />
    <button type="button" className="image-picker-button" onClick={() => inputRef.current?.click()}><ImagePlus size={20} /> Chọn ảnh từ thiết bị</button>
    <p className="image-picker-note">Có thể chọn nhiều ảnh (tối đa 10 ảnh, mỗi ảnh tối đa 5 MB).</p>
    {previews.length > 0 && <div className="image-preview-grid">{previews.map((preview, index) => <div className="image-preview" key={preview}>
      <img src={preview} alt={`Ảnh đã chọn ${index + 1}`} />
      <button type="button" aria-label={`Xóa ảnh ${index + 1}`} onClick={() => onChange(files.filter((_, current) => current !== index))}><X size={14} /></button>
    </div>)}</div>}
  </div>;
}
