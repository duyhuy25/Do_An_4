import React from 'react';
import { Search, ShieldCheck, UserCheck, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentPortal: 'user' | 'admin';
  onPortalChange: (portal: 'user' | 'admin') => void;
  pendingCount?: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onPortalChange,
  pendingCount = 0,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const isAdminOrStaff = currentUser && (currentUser.RoleName === 'Admin' || currentUser.RoleName === 'Staff' || currentUser.RoleID === 3 || currentUser.RoleID === 2);

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-logo" onClick={() => onPortalChange('user')}>
          <div className="logo-icon">
            <Search size={22} />
          </div>
          <div>
            <span>Campus Lost & Found</span>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
              Hệ thống Quản lý Đồ Thất Lạc (Do_An_4)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Switcher only visible if Admin or Staff */}
          {isAdminOrStaff && (
            <div className="portal-switcher">
              <button
                className={`portal-btn ${currentPortal === 'user' ? 'active' : ''}`}
                onClick={() => onPortalChange('user')}
              >
                <UserCheck size={16} />
                <span>Giao diện Người dùng</span>
              </button>
              <button
                className={`portal-btn ${currentPortal === 'admin' ? 'active' : ''}`}
                onClick={() => onPortalChange('admin')}
              >
                <ShieldCheck size={16} />
                <span>Trang Admin</span>
                {pendingCount > 0 && (
                  <span className="badge-count badge-amber" style={{ marginLeft: 4 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Account Profile / Auth status */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                  {currentUser.FullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: isAdminOrStaff ? '#fbbf24' : '#38bdf8', fontWeight: 600 }}>
                  {isAdminOrStaff ? `⚙️ ${currentUser.RoleName}` : `🎓 Sinh viên ${currentUser.StudentCode ? `[${currentUser.StudentCode}]` : ''}`}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Đăng xuất">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
              <LogIn size={16} /> Đăng Nhập / Đăng Ký
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
