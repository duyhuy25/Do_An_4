import React, { useState, useEffect } from 'react';
// @ts-expect-error CSS imports are not declared in this project setup
import './styles.css';
import { Navbar } from './components/Navbar';
import { UserPortal } from './components/UserPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ExtraInfoPanel } from './components/ExtraInfoPanel';
import {
  LostReport,
  Item,
  Category,
  Location,
  StorageLocation,
  MatchSuggestion,
  Claim,
  AdminStats,
  AuditLog,
  UserReport,
  User
} from './types';

const API_BASE = 'http://localhost:3000/api';

export function App() {
  const [currentPortal, setCurrentPortal] = useState<'user' | 'admin'>('user');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lost_found_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalLost: 0,
    pendingLost: 0,
    totalItems: 0,
    storedItems: 0,
    returnedItems: 0,
    pendingClaims: 0,
    totalUsers: 0
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [
        resCats,
        resLocs,
        resStorages,
        resLost,
        resItems,
        resClaims,
        resMatches,
        resStats,
        resLogs,
        resReports
      ] = await Promise.all([
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/locations`),
        fetch(`${API_BASE}/storage-locations`),
        fetch(`${API_BASE}/lost-reports`),
        fetch(`${API_BASE}/items`),
        fetch(`${API_BASE}/claims`),
        fetch(`${API_BASE}/match-suggestions`),
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/logs`),
        fetch(`${API_BASE}/admin/reports`)
      ]);

      if (resCats.ok) setCategories(await resCats.json());
      if (resLocs.ok) setLocations(await resLocs.json());
      if (resStorages.ok) setStorageLocations(await resStorages.json());
      if (resLost.ok) setLostReports(await resLost.json());
      if (resItems.ok) setItems(await resItems.json());
      if (resClaims.ok) setClaims(await resClaims.json());
      if (resMatches.ok) setMatchSuggestions(await resMatches.json());
      if (resStats.ok) setAdminStats(await resStats.json());
      if (resLogs.ok) setAuditLogs(await resLogs.json());
      if (resReports.ok) setUserReports(await resReports.json());
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ server API:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync current user to localStorage
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('lost_found_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lost_found_user');
    setCurrentPortal('user');
  };

  // Guard Admin Portal Access
  const isAdminOrStaff = currentUser && (currentUser.RoleName === 'Admin' || currentUser.RoleName === 'Staff' || currentUser.RoleID === 3 || currentUser.RoleID === 2);

  const handlePortalSwitch = (portal: 'user' | 'admin') => {
    if (portal === 'admin' && !isAdminOrStaff) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPortal(portal);
  };

  // Handlers for User Actions
  const handleAddLostReport = async (data: any) => {
    try {
      const { images = [], ...report } = data;
      const formData = new FormData();
      Object.entries({ ...report, UserID: currentUser?.UserID || 2 }).forEach(([key, value]) => formData.append(key, String(value)));
      images.forEach((image: File) => formData.append('images', image));
      const res = await fetch(`${API_BASE}/lost-reports`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi gửi báo mất đồ:', err);
    }
  };

  const handleAddFoundReport = async (data: any) => {
    try {
      const { images = [], ...item } = data;
      const formData = new FormData();
      Object.entries(item).forEach(([key, value]) => formData.append(key, String(value)));
      images.forEach((image: File) => formData.append('images', image));
      const res = await fetch(`${API_BASE}/found-reports`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi gửi báo nhặt đồ:', err);
    }
  };

  const handleSubmitClaim = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, UserID: currentUser?.UserID || 2 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu nhận đồ:', err);
    }
  };

  // Handlers for Admin Actions
  const handleApproveLostReport = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE}/lost-reports/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status, ApprovedBy: currentUser?.UserID || 1 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi duyệt bài báo mất:', err);
    }
  };

  const handleUpdateItemStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái đồ vật:', err);
    }
  };

  const handleReviewClaim = async (id: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/claims/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status, RejectionReason: rejectionReason, ReviewedBy: currentUser?.UserID || 1 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu nhận đồ:', err);
    }
  };

  const handleAddCategory = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi thêm danh mục:', err);
    }
  };

  const handleAddLocation = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Lỗi khi thêm địa điểm:', err);
    }
  };

  return (
    <div className="app-root">
      {/* PHẦN 1: HEAD (Thanh điều hướng Navbar) */}
      <Navbar
        currentPortal={currentPortal}
        onPortalChange={handlePortalSwitch}
        pendingCount={adminStats.pendingLost + adminStats.pendingClaims}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* KHU VỰC BỐ CỤC CHÍNH (CONTENT + THÔNG TIN NGOÀI LỀ) */}
      <div className="page-container" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="main-layout-container">
          {/* PHẦN 2: CONTENT (Nội dung ứng dụng chính) */}
          <main className="main-content">
            {currentPortal === 'user' || !isAdminOrStaff ? (
              <UserPortal
                lostReports={lostReports}
                items={items}
                categories={categories}
                locations={locations}
                storageLocations={storageLocations}
                matchSuggestions={matchSuggestions}
                claims={currentUser ? claims.filter(c => c.UserID === currentUser.UserID) : claims}
                currentUser={currentUser}
                onOpenAuth={() => setShowAuthModal(true)}
                onAddLostReport={handleAddLostReport}
                onAddFoundReport={handleAddFoundReport}
                onSubmitClaim={handleSubmitClaim}
              />
            ) : (
              <AdminDashboard
                stats={adminStats}
                lostReports={lostReports}
                items={items}
                claims={claims}
                categories={categories}
                locations={locations}
                storageLocations={storageLocations}
                auditLogs={auditLogs}
                userReports={userReports}
                onApproveLostReport={handleApproveLostReport}
                onUpdateItemStatus={handleUpdateItemStatus}
                onReviewClaim={handleReviewClaim}
                onAddCategory={handleAddCategory}
                onAddLocation={handleAddLocation}
              />
            )}
          </main>
        </div>

        {/* PHẦN 3: THÔNG TIN NGOÀI LỀ (đặt ngay dưới main-layout-container) */}
        <aside className="extra-info-sidebar">
          <ExtraInfoPanel />
        </aside>
      </div>

      <Footer />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
