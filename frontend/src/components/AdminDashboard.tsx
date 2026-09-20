import React, { useState } from 'react';
import {
  FileText,
  Package,
  CheckCircle,
  Clock,
  ShieldCheck,
  PlusCircle,
  Layers,
  MapPin,
  Activity,
  UserCheck,
  XCircle,
  FolderPlus,
  MapPinPlus
} from 'lucide-react';
import {
  LostReport,
  Item,
  Claim,
  Category,
  Location,
  StorageLocation,
  AdminStats,
  AuditLog,
  UserReport
} from '../types';

interface AdminDashboardProps {
  stats: AdminStats;
  lostReports: LostReport[];
  items: Item[];
  claims: Claim[];
  categories: Category[];
  locations: Location[];
  storageLocations: StorageLocation[];
  auditLogs: AuditLog[];
  userReports?: UserReport[];
  onApproveLostReport: (id: number, status: 'APPROVED' | 'REJECTED') => void;
  onUpdateItemStatus: (id: number, status: string) => void;
  onReviewClaim: (id: number, status: 'APPROVED' | 'REJECTED') => void;
  onAddCategory: (data: any) => void;
  onAddLocation: (data: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  lostReports,
  items,
  claims,
  categories,
  locations,
  storageLocations,
  auditLogs,
  userReports = [],
  onApproveLostReport,
  onUpdateItemStatus,
  onReviewClaim,
  onAddCategory,
  onAddLocation
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'items' | 'claims' | 'config' | 'logs'>('reports');

  // Trạng thái form thêm nhanh danh mục/địa điểm
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');

  return (
    <div className="page-container">
      {/* Tiêu đề Admin */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>⚙️ Trang Quản Trị Hệ Thống (Admin Portal)</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Duyệt tin đăng, quản lý kho lưu giữ tài sản thất lạc & xử lý trao trả sinh viên (SQL Schema: Do_An_4)
          </p>
        </div>
      </div>

      {/* Các widget thống kê */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalLost}</h3>
            <p>Tổng bài báo mất</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingLost}</h3>
            <p>Tin chờ duyệt</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.storedItems}</h3>
            <p>Đồ đang giữ trong kho</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.returnedItems}</h3>
            <p>Đồ đã trao trả</p>
          </div>
        </div>
      </div>

      {/* Thanh điều hướng quản trị */}
      <div className="tabs-header">
        <button
          className={`tab-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={16} />
          <span>Duyệt Tin Báo Mất</span>
          <span className="badge-count badge-amber">
            {lostReports.filter((r) => r.Status === 'PENDING').length}
          </span>
        </button>

        <button
          className={`tab-item ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          <Package size={16} />
          <span>Quản Lý Kho & Đồ Nhặt Độc</span>
          <span className="badge-count">{items.length}</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          <UserCheck size={16} />
          <span>Xử Lý Yêu Cầu Nhận Đồ (Claims)</span>
          <span className="badge-count badge-amber">
            {claims.filter((c) => c.Status === 'PENDING').length}
          </span>
        </button>

        <button
          className={`tab-item ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Layers size={16} />
          <span>Danh Mục & Địa Điểm</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={16} />
          <span>Nhật Ký Hệ Thống (Audit Logs)</span>
        </button>
      </div>

      {/* TAB 1: DUYỆT TIN BÁO MẤT */}
      {activeTab === 'reports' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Bài</th>
                <th>Tiêu Đề Báo Mất</th>
                <th>Người Đăng</th>
                <th>Danh Mục</th>
                <th>Vị Trí Mất</th>
                <th>Ngày Mất</th>
                <th>Trạng Thái</th>
                <th>Hành Động Admin</th>
              </tr>
            </thead>
            <tbody>
              {lostReports.map((r) => (
                <tr key={r.LostReportID}>
                  <td><strong>#LR-{r.LostReportID}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.Title}</div>
                    <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{r.DistinguishingFeatures}</div>
                  </td>
                  <td>{r.UserName} ({r.UserPhone})</td>
                  <td><span className="card-category">{r.CategoryName}</span></td>
                  <td>{r.LocationName}</td>
                  <td>{new Date(r.LostDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`card-badge badge-status-${r.Status.toLowerCase()}`}>
                      {r.Status === 'APPROVED' ? 'Đã duyệt' : r.Status === 'PENDING' ? 'Chờ duyệt' : r.Status}
                    </span>
                  </td>
                  <td>
                    {r.Status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => onApproveLostReport(r.LostReportID, 'APPROVED')}
                        >
                          <CheckCircle size={14} /> Duyệt
                        </button>
                        <button
                          className="btn btn-rose btn-sm"
                          onClick={() => onApproveLostReport(r.LostReportID, 'REJECTED')}
                        >
                          <XCircle size={14} /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ KHO ĐỒ */}
      {activeTab === 'items' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Tracking</th>
                <th>Tên Đồ Vật Nhặt Được</th>
                <th>Nơi Nhặt</th>
                <th>Vị Trí Kho Lưu</th>
                <th>Ngày Nhặt</th>
                <th>Trạng Thái</th>
                <th>Cập Nhật Kho</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.ItemID}>
                  <td style={{ fontWeight: 800, color: '#38bdf8' }}>{item.TrackingCode}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{item.ItemName}</div>
                    <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{item.IdentifyingFeatures}</div>
                  </td>
                  <td>{item.LocationName}</td>
                  <td style={{ color: '#a5b4fc', fontWeight: 600 }}>{item.StorageName}</td>
                  <td>{new Date(item.FoundDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`card-badge badge-status-${item.Status.toLowerCase()}`}>
                      {item.Status === 'STORED' ? 'Đang trong kho' : item.Status === 'RETURNED' ? 'Đã trao trả' : item.Status}
                    </span>
                  </td>
                  <td>
                    {item.Status === 'STORED' ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onUpdateItemStatus(item.ItemID, 'RETURNED')}
                      >
                        Đánh dấu đã trao trả
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: XỬ LÝ YÊU CẦU NHẬN ĐỒ */}
      {activeTab === 'claims' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Claim</th>
                <th>Tên Đồ Vật</th>
                <th>Người Yêu Cầu</th>
                <th>Bằng Chứng Xác Minh Quyền Sở Hữu</th>
                <th>Thời Gian Gửi</th>
                <th>Trạng Thái</th>
                <th>Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.ClaimID}>
                  <td><strong>#CLM-{c.ClaimID}</strong></td>
                  <td style={{ fontWeight: 700, color: '#a5b4fc' }}>{c.ItemName}</td>
                  <td>
                    <div>{c.UserName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.UserEmail} | {c.UserPhone}</div>
                  </td>
                  <td style={{ maxWidth: 300, fontSize: '0.85rem' }}>{c.OwnershipEvidence}</td>
                  <td>{new Date(c.SubmittedAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <span className={`card-badge badge-status-${c.Status.toLowerCase()}`}>
                      {c.Status === 'PENDING' ? 'Chờ duyệt' : c.Status === 'APPROVED' ? 'Đã trao trả' : c.Status}
                    </span>
                  </td>
                  <td>
                    {c.Status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => onReviewClaim(c.ClaimID, 'APPROVED')}
                        >
                          <CheckCircle size={14} /> Duyệt Trao Trả
                        </button>
                        <button
                          className="btn btn-rose btn-sm"
                          onClick={() => onReviewClaim(c.ClaimID, 'REJECTED')}
                        >
                          <XCircle size={14} /> Từ Chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Đã quyết định</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ DANH MỤC VÀ ĐỊA ĐIỂM */}
      {activeTab === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Categories Card */}
          <div className="filter-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderPlus size={20} className="text-cyan" /> Danh Mục Đồ Vật ({categories.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Tên danh mục mới..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (newCatName) {
                    onAddCategory({ CategoryName: newCatName, Description: newCatDesc });
                    setNewCatName('');
                    setNewCatDesc('');
                  }
                }}
              >
                Thêm
              </button>
            </div>

            <div className="data-table-container" style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Danh Mục</th>
                    <th>Mô Tả</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.CategoryID}>
                      <td>#{cat.CategoryID}</td>
                      <td style={{ fontWeight: 700 }}>{cat.CategoryName}</td>
                      <td style={{ color: '#94a3b8' }}>{cat.Description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Locations Card */}
          <div className="filter-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPinPlus size={20} className="text-emerald" /> Địa Điểm Trong Trường ({locations.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Tên địa điểm mới..."
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Tòa nhà (Tòa A...)"
                value={newLocBuilding}
                onChange={(e) => setNewLocBuilding(e.target.value)}
              />
              <button
                className="btn btn-emerald btn-sm"
                onClick={() => {
                  if (newLocName) {
                    onAddLocation({ LocationName: newLocName, Building: newLocBuilding, Floor: '' });
                    setNewLocName('');
                    setNewLocBuilding('');
                  }
                }}
              >
                Thêm
              </button>
            </div>

            <div className="data-table-container" style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Địa Điểm</th>
                    <th>Tòa Nhà</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.LocationID}>
                      <td>#{loc.LocationID}</td>
                      <td style={{ fontWeight: 700 }}>{loc.LocationName}</td>
                      <td style={{ color: '#94a3b8' }}>{loc.Building || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NHẬT KÝ HỆ THỐNG */}
      {activeTab === 'logs' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Log</th>
                <th>Thao Tác System</th>
                <th>Bảng Dữ Liệu</th>
                <th>Chi Tiết Nhật Ký</th>
                <th>Thời Gian Thực Hiện</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.LogID}>
                  <td>#LOG-{log.LogID}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{log.Action}</span>
                  </td>
                  <td>{log.EntityName}</td>
                  <td>{log.Details}</td>
                  <td>{new Date(log.CreatedAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
