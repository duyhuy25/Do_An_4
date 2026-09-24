import React, { useState } from 'react';
import { X, PackageCheck } from 'lucide-react';
import { Category, Location, StorageLocation } from '../types';
import { ImagePicker } from './ImagePicker';

interface ReportFoundModalProps {
  categories: Category[];
  locations: Location[];
  storageLocations: StorageLocation[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ReportFoundModal: React.FC<ReportFoundModalProps> = ({
  categories,
  locations,
  storageLocations,
  onClose,
  onSubmit
}) => {
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.CategoryID || 1);
  const [locationId, setLocationId] = useState(locations[0]?.LocationID || 1);
  const [storageLocationId, setStorageLocationId] = useState(storageLocations[0]?.StorageLocationID || 1);
  const [foundDate, setFoundDate] = useState(new Date().toISOString().slice(0, 16));
  const [features, setFeatures] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onSubmit({
      CategoryID: categoryId,
      LocationID: locationId,
      StorageLocationID: storageLocationId,
      ItemName: itemName,
      Description: description,
      IdentifyingFeatures: features,
      FoundDate: foundDate,
      images
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>🎁 Báo Nhặt Đồ & Bàn Giao Lưu Kho</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group full-width">
              <label>Tên món đồ nhặt được *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Chùm chìa khóa Honda có móc gấu đỏ"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Danh mục đồ vật *</label>
                <select
                  className="form-control"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                >
                  {categories.map((c) => (
                    <option key={c.CategoryID} value={c.CategoryID}>
                      {c.CategoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nơi nhặt được *</label>
                <select
                  className="form-control"
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                >
                  {locations.map((l) => (
                    <option key={l.LocationID} value={l.LocationID}>
                      {l.LocationName} ({l.Building})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bàn giao lưu tại kho *</label>
                <select
                  className="form-control"
                  value={storageLocationId}
                  onChange={(e) => setStorageLocationId(Number(e.target.value))}
                >
                  {storageLocations.map((s) => (
                    <option key={s.StorageLocationID} value={s.StorageLocationID}>
                      {s.StorageName} ({s.LocationDescription})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Thời gian nhặt được</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={foundDate}
                  onChange={(e) => setFoundDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Đặc điểm bảo mật / Chi tiết vật phẩm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Thông tin giúp kiểm chứng chủ sở hữu..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Mô tả chi tiết</label>
              <textarea
                className="form-control"
                placeholder="Ghi chú hoàn cảnh nhặt đồ, người bàn giao..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Ảnh chụp đồ vật</label>
              <ImagePicker files={images} onChange={setImages} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-emerald">
              <PackageCheck size={16} /> Nhập Kho & Tạo Mã Định Danh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
