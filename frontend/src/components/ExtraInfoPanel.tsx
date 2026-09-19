import React from 'react';
import { Info, Bell, ShieldCheck, HelpCircle, ExternalLink, MessageSquare } from 'lucide-react';

export const ExtraInfoPanel: React.FC = () => (
  <div className="extra-info-card">
    <div className="extra-info-header"><Info size={18} className="text-cyan" /><h3>Thông Tin Ngoài Lề &amp; Thông Báo</h3></div>
    <div className="extra-info-content">
      <div className="extra-info-section"><div className="extra-info-badge">Mới</div><p>Hệ thống đang hỗ trợ báo mất, báo nhặt và xử lý yêu cầu nhận đồ nhanh hơn.</p></div>
      <div className="extra-info-section"><h4>Hướng dẫn nhanh</h4><ul className="extra-info-list"><li><Bell size={14} /> Theo dõi trạng thái báo cáo</li><li><ShieldCheck size={14} /> Xác minh thông tin trước khi nhận đồ</li><li><MessageSquare size={14} /> Liên hệ hỗ trợ khi cần</li></ul></div>
      <div className="extra-info-section"><h4>Trợ giúp</h4><ul className="extra-info-list"><li><HelpCircle size={14} /> Cập nhật thông tin cá nhân</li><li><ExternalLink size={14} /> Xem điều khoản hỗ trợ</li></ul></div>
    </div>
  </div>
);
