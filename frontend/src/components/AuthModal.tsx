import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Trạng thái form đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Trạng thái form đăng ký
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');
  const [regClassName, setRegClassName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }

      onLoginSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FullName: regFullName,
          Email: regEmail,
          Password: regPassword,
          StudentCode: regStudentCode,
          ClassName: regClassName,
          Phone: regPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký thất bại.');
      }

      onLoginSuccess(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('sinhvien1@student.edu.vn');
      setPassword('123456');
    } else {
      setEmail('admin@school.edu.vn');
      setPassword('admin123');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>{isLoginView ? '🔑 Đăng Nhập Hệ Thống' : '🎓 Đăng Ký Tài Khoản Sinh Viên'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: isLoginView ? 'var(--primary-light)' : 'transparent',
              color: isLoginView ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              borderBottom: isLoginView ? '2px solid var(--primary)' : 'none'
            }}
            onClick={() => {
              setIsLoginView(true);
              setErrorMsg('');
            }}
          >
            Đăng Nhập
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: !isLoginView ? 'var(--primary-light)' : 'transparent',
              color: !isLoginView ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              borderBottom: !isLoginView ? '2px solid var(--primary)' : 'none'
            }}
            onClick={() => {
              setIsLoginView(false);
              setErrorMsg('');
            }}
          >
            Đăng Ký Sinh Viên
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                marginBottom: '1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLogin}>
              <div className="form-group full-width">
                <label>Email Sinh viên / Quản trị *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="sinhvien1@student.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Nút điền nhanh tài khoản mẫu */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '0.75rem',
                  borderRadius: 8,
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <Sparkles size={12} className="text-amber" /> Thử nhanh tài khoản mẫu:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => fillQuickDemo('student')}
                  >
                    🎓 SV Demo (Role Sinh Viên)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => fillQuickDemo('admin')}
                  >
                    ⚙️ Admin Demo (Role Admin)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                <LogIn size={18} /> {loading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group full-width">
                <label>Họ và Tên *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Email Sinh viên *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="nguyenvana@student.edu.vn"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Mã Sinh Viên</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="SV202601"
                    value={regStudentCode}
                    onChange={(e) => setRegStudentCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Lớp học</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="CNTT-K66"
                    value={regClassName}
                    onChange={(e) => setRegClassName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0912345678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Mật khẩu đăng nhập *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-emerald"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                <UserPlus size={18} /> {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Sinh Viên'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
