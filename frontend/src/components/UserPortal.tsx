import React, { useState } from 'react';
import { Search, PlusCircle, Sparkles, MapPin, Calendar, Award, AlertCircle, Eye, Handshake, LogIn } from 'lucide-react';
import { LostReport, Item, Category, Location, StorageLocation, MatchSuggestion, Claim, User } from '../types';
import { ReportLostModal } from './ReportLostModal';
import { ReportFoundModal } from './ReportFoundModal';
import { ClaimModal } from './ClaimModal';

interface UserPortalProps {
  lostReports: LostReport[];
  items: Item[];
  categories: Category[];
  locations: Location[];
  storageLocations: StorageLocation[];
  matchSuggestions: MatchSuggestion[];
  claims: Claim[];
  currentUser: User | null;
  onOpenAuth: () => void;
  onAddLostReport: (data: any) => void;
  onAddFoundReport: (data: any) => void;
  onSubmitClaim: (data: any) => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  lostReports,
  items,
  categories,
  locations,
  storageLocations,
  matchSuggestions,
  claims,
  currentUser,
  onOpenAuth,
  onAddLostReport,
  onAddFoundReport,
  onSubmitClaim
}) => {
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'my-claims' | 'matches'>('lost');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [claimItem, setClaimItem] = useState<Item | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{ type: 'lost' | 'item'; data: any } | null>(null);

  const requireAuthAction = (action: () => void) => {
    if (!currentUser) {
      onOpenAuth();
    } else {
      action();
    }
  };

  // Filter lost reports
  const filteredLost = lostReports.filter((r) => {
    const matchesSearch =
      r.Title.toLowerCase().includes(search.toLowerCase()) ||
      (r.Description && r.Description.toLowerCase().includes(search.toLowerCase())) ||
      (r.DistinguishingFeatures && r.DistinguishingFeatures.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || r.CategoryID === parseInt(selectedCategory);
    const matchesLocation = selectedLocation === 'ALL' || r.LocationID === parseInt(selectedLocation);
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Filter found items
  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.ItemName.toLowerCase().includes(search.toLowerCase()) ||
      (i.Description && i.Description.toLowerCase().includes(search.toLowerCase())) ||
      (i.IdentifyingFeatures && i.IdentifyingFeatures.toLowerCase().includes(search.toLowerCase())) ||
      (i.TrackingCode && i.TrackingCode.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || i.CategoryID === parseInt(selectedCategory);
    const matchesLocation = selectedLocation === 'ALL' || i.LocationID === parseInt(selectedLocation);
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Hệ Thống Tìm & Báo Đồ Thất Lạc Trường Học</h1>
          <p>
            Tra cứu nhanh chóng đồ dùng bị thất lạc, khai báo đồ nhặt được hoặc gửi yêu cầu nhận lại tài sản lưu giữ tại kho của trường.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => requireAuthAction(() => setShowLostModal(true))}
          >
            <PlusCircle size={18} /> Đăng Tin Báo Mất Đồ
          </button>
          <button
            className="btn btn-emerald"
            onClick={() => requireAuthAction(() => setShowFoundModal(true))}
          >
            <Handshake size={18} /> Báo Nhặt Đồ Thất Lạc
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="search-input-group">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo tên món đồ, đặc điểm nhận dạng, mã tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">📦 Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.CategoryID} value={c.CategoryID}>
              {c.CategoryName}
            </option>
          ))}
        </select>

        <select
          className="select-filter"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="ALL">📍 Tất cả địa điểm</option>
          {locations.map((l) => (
            <option key={l.LocationID} value={l.LocationID}>
              {l.LocationName} ({l.Building})
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-header">
        <button
          className={`tab-item ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          <span>📢 Đồ Cần Tìm (Báo Mất)</span>
          <span className="badge-count">{filteredLost.length}</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          <span>📦 Đồ Đã Nhặt & Đang Lưu Kho</span>
          <span className="badge-count">{filteredItems.length}</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Sparkles size={16} className="text-amber" />
          <span>Gợi Ý Trùng Khớp Tự Động</span>
          <span className="badge-count badge-amber">{matchSuggestions.length}</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'my-claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-claims')}
        >
          <span>📋 Yêu Cầu Nhận Đồ Của Tôi</span>
          <span className="badge-count">{claims.length}</span>
        </button>
      </div>

      {/* TAB 1: LOST REPORTS */}
      {activeTab === 'lost' && (
        <>
          {filteredLost.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <h3>Chưa có tin báo mất nào phù hợp</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredLost.map((report) => (
                <div key={report.LostReportID} className="item-card">
                  <div className="card-img-wrap">
                    <img
                      src={report.ImageURL}
                      alt={report.Title}
                      className="card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className={`card-badge badge-status-${report.Status.toLowerCase()}`}>
                      {report.Status === 'APPROVED' ? 'Đã duyệt' : report.Status === 'PENDING' ? 'Chờ duyệt' : report.Status}
                    </span>
                  </div>

                  <div className="card-body">
                    <span className="card-category">{report.CategoryName}</span>
                    <h3 className="card-title">{report.Title}</h3>
                    <p className="card-desc">{report.Description || 'Không có mô tả thêm'}</p>

                    <div className="card-meta">
                      <div className="card-meta-item">
                        <MapPin size={14} /> Vị trí: <strong style={{ color: '#f8fafc' }}>{report.LocationName}</strong>
                      </div>
                      <div className="card-meta-item">
                        <Calendar size={14} /> Mất ngày: {new Date(report.LostDate).toLocaleDateString('vi-VN')}
                      </div>
                      {report.RewardAmount && report.RewardAmount > 0 ? (
                        <div className="card-meta-item text-amber" style={{ fontWeight: 700 }}>
                          <Award size={14} /> Hậu tạ: {report.RewardAmount.toLocaleString('vi-VN')} VNĐ
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="card-footer">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Người đăng: {report.UserName}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDetail({ type: 'lost', data: report })}
                    >
                      <Eye size={14} /> Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: FOUND ITEMS IN STORAGE */}
      {activeTab === 'found' && (
        <>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <h3>Không tìm thấy vật phẩm nhặt được</h3>
              <p>Hiện chưa có thông tin món đồ lưu kho khớp với tìm kiếm.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredItems.map((item) => (
                <div key={item.ItemID} className="item-card">
                  <div className="card-img-wrap">
                    <img
                      src={item.ImageURL}
                      alt={item.ItemName}
                      className="card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className={`card-badge badge-status-${item.Status.toLowerCase()}`}>
                      {item.Status === 'STORED' ? 'Đang lưu kho' : item.Status === 'RETURNED' ? 'Đã trao trả' : item.Status}
                    </span>
                  </div>

                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="card-category">{item.CategoryName}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{item.TrackingCode}</span>
                    </div>
                    <h3 className="card-title">{item.ItemName}</h3>
                    <p className="card-desc">{item.Description || 'Đang lưu trữ tại kho quản lý'}</p>

                    <div className="card-meta">
                      <div className="card-meta-item">
                        <MapPin size={14} /> Nơi nhặt: <strong style={{ color: '#f8fafc' }}>{item.LocationName}</strong>
                      </div>
                      <div className="card-meta-item">
                        🏢 Lưu giữ tại: <strong style={{ color: '#a5b4fc' }}>{item.StorageName}</strong>
                      </div>
                      <div className="card-meta-item">
                        <Calendar size={14} /> Nhặt ngày: {new Date(item.FoundDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDetail({ type: 'item', data: item })}
                    >
                      <Eye size={14} /> Xem Chi Tiết
                    </button>
                    {item.Status === 'STORED' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => requireAuthAction(() => setClaimItem(item))}
                      >
                        <Handshake size={14} /> Xin Nhận Lại Đồ
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Đã trao trả</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: AUTOMATIC MATCH SUGGESTIONS */}
      {activeTab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matchSuggestions.map((m) => (
            <div
              key={m.MatchID}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800
                  }}
                >
                  {m.MatchScore}%
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    📢 "{m.LostTitle}" <span style={{ color: '#94a3b8' }}>có thể là</span> 📦 "{m.ItemName}"
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>{m.Reason}</p>
                </div>
              </div>
              <span className="badge-count badge-amber">Độ tương thích cao</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MY CLAIMS */}
      {activeTab === 'my-claims' && (
        <div className="data-table-container">
          {!currentUser ? (
            <div className="empty-state">
              <LogIn size={48} />
              <h3>Vui lòng đăng nhập để xem lịch sử yêu cầu của bạn</h3>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onOpenAuth}>
                Đăng Nhập Ngay
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Yêu Cầu</th>
                  <th>Tên Đồ Vật</th>
                  <th>Lý Do / Bằng Chứng Khớp</th>
                  <th>Ngày Gửi</th>
                  <th>Trạng Thái Xử Lý</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                      Chưa có yêu cầu nhận đồ nào được tạo.
                    </td>
                  </tr>
                ) : (
                  claims.map((c) => (
                    <tr key={c.ClaimID}>
                      <td><strong>#CLM-{c.ClaimID}</strong></td>
                      <td style={{ fontWeight: 700, color: '#a5b4fc' }}>{c.ItemName}</td>
                      <td style={{ maxWidth: 320 }}>{c.OwnershipEvidence}</td>
                      <td>{new Date(c.SubmittedAt).toLocaleString('vi-VN')}</td>
                      <td>
                        <span className={`card-badge badge-status-${c.Status.toLowerCase()}`}>
                          {c.Status === 'PENDING' ? 'Đang chờ CTSV xác minh' : c.Status === 'APPROVED' ? 'Đã duyệt nhận' : c.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODALS */}
      {showLostModal && (
        <ReportLostModal
          categories={categories}
          locations={locations}
          onClose={() => setShowLostModal(false)}
          onSubmit={(data) => {
            onAddLostReport({ ...data, UserID: currentUser?.UserID || 2 });
            setShowLostModal(false);
          }}
        />
      )}

      {showFoundModal && (
        <ReportFoundModal
          categories={categories}
          locations={locations}
          storageLocations={storageLocations}
          onClose={() => setShowFoundModal(false)}
          onSubmit={(data) => {
            onAddFoundReport(data);
            setShowFoundModal(false);
          }}
        />
      )}

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onSubmit={(data) => {
            onSubmitClaim({ ...data, UserID: currentUser?.UserID || 2 });
            setClaimItem(null);
          }}
        />
      )}

      {/* Detail Viewer */}
      {selectedDetail && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>
                {selectedDetail.type === 'lost' ? '📢 Chi Tiết Bài Báo Mất' : '📦 Chi Tiết Đồ Vật Trong Kho'}
              </h2>
              <button className="modal-close-btn" onClick={() => setSelectedDetail(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <img
                src={selectedDetail.data.ImageURL}
                alt=""
                style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, marginBottom: '1rem' }}
              />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {selectedDetail.data.Title || selectedDetail.data.ItemName}
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                {selectedDetail.data.Description || 'Không có mô tả thêm.'}
              </p>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 8 }}>
                <div><strong>Danh mục:</strong> {selectedDetail.data.CategoryName}</div>
                <div><strong>Địa điểm:</strong> {selectedDetail.data.LocationName}</div>
                {selectedDetail.data.TrackingCode && (
                  <div><strong>Mã Tracking:</strong> <span style={{ color: '#38bdf8', fontWeight: 700 }}>{selectedDetail.data.TrackingCode}</span></div>
                )}
                {selectedDetail.data.DistinguishingFeatures && (
                  <div><strong>Đặc điểm nhận dạng:</strong> {selectedDetail.data.DistinguishingFeatures}</div>
                )}
                {selectedDetail.data.IdentifyingFeatures && (
                  <div><strong>Đặc điểm nhận dạng:</strong> {selectedDetail.data.IdentifyingFeatures}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDetail(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
