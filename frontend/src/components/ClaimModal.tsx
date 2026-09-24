import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Item } from '../types';

interface ClaimModalProps {
  item: Item;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, onClose, onSubmit }) => {
  const [claimReason, setClaimReason] = useState('');
  const [evidence, setEvidence] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidence.trim()) return;

    onSubmit({
      ItemID: item.ItemID,
      UserID: 3, // Người dùng mẫu (sinh viên)
      ClaimReason: claimReason,
      OwnershipEvidence: evidence
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>📩 Gửi Yêu Cầu Nhận Lại Đồ Thất Lạc</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a5b4fc' }}>Vật phẩm đang yêu cầu nhận:</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginTop: '0.2rem' }}>{item.ItemName}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Mã theo dõi: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{item.TrackingCode}</span> | Vị trí nhặt: {item.LocationName} | Nơi lưu kho: {item.StorageName}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Lý do xin nhận lại món đồ</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Đây là món đồ em đã đánh rơi tại Căng tin ngày 29/08..."
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Bằng chứng xác minh quyền sở hữu *</label>
              <textarea
                className="form-control"
                placeholder="Cung cấp đặc điểm bí mật, số IMEI, hóa đơn, giấy tờ tùy thân bên trong ví, mật khẩu mở khóa, hình ảnh đã chụp trước đây..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                * Thông tin này sẽ được Ban quản trị/Phòng CTSV đối chiếu trước khi hẹn gặp bạn trao trả.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Gửi Xác Minh Nhận Đồ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
