import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Category, Location } from '../types';
import { ImagePicker } from './ImagePicker';

interface ReportLostModalProps {
  categories: Category[];
  locations: Location[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ReportLostModal: React.FC<ReportLostModalProps> = ({
  categories,
  locations,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.CategoryID || 1);
  const [locationId, setLocationId] = useState(locations[0]?.LocationID || 1);
  const [lostDate, setLostDate] = useState(new Date().toISOString().slice(0, 16));
  const [rewardAmount, setRewardAmount] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      UserID: 2, // Người dùng mẫu
      CategoryID: categoryId,
      LocationID: locationId,
      Title: title,
      Description: description,
      LostDate: lostDate,
      DistinguishingFeatures: features,
      RewardAmount: rewardAmount ? parseFloat(rewardAmount) : 0,
      images
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>📢 Đăng Tin Báo Mất Đồ</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group full-width">
              <label>Tiêu đề bài đăng *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Mất điện thoại iPhone 13 Pro màu xám tại Thư viện"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Danh mục món đồ *</label>
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
                <label>Khu vực đánh rơi *</label>
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
                <label>Thời gian đánh rơi</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={lostDate}
                  onChange={(e) => setLostDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tiền hậu tạ / Thưởng (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Đặc điểm nhận dạng (Mô tả chi tiết để xác minh)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Ốp lưng dán hình Pikachu, màn hình có vết xước góc phải..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Mô tả thêm hoàn cảnh đánh rơi</label>
              <textarea
                className="form-control"
                placeholder="Nhập thông tin chi tiết giúp mọi người tìm lại..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Hình ảnh minh họa</label>
              <ImagePicker files={images} onChange={setImages} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Upload size={16} /> Gửi Bài Đăng Duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
