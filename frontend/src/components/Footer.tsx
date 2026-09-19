import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, School } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="site-footer"><div className="footer-container">
    <div className="footer-section footer-school"><div className="footer-title"><School size={19} /> Thông tin trường</div><p>Hệ Thống Tìm &amp; Báo Đồ Thất Lạc Trường Học</p><p>Hỗ trợ sinh viên và cán bộ tìm lại tài sản thất lạc trong khuôn viên trường.</p></div>
    <div className="footer-section footer-contact"><div className="footer-title"><MessageCircle size={19} /> Liên hệ &amp; ứng dụng</div><a href="mailto:hotro@truonghoc.edu.vn"><Mail size={16} /> hotro@truonghoc.edu.vn</a><a href="tel:19001000"><Phone size={16} /> 1900 1000</a><span className="footer-app-note">Tải ứng dụng để nhận thông báo nhanh nhất.</span></div>
    <div className="footer-section footer-map"><div className="footer-title"><MapPin size={19} /> Bản đồ</div><a className="map-preview" href="https://www.google.com/maps/search/?api=1&query=tr%C6%B0%E1%BB%9Dng+h%E1%BB%8Dc" target="_blank" rel="noreferrer"><MapPin size={25} /><span>Xem vị trí trường<br /><small>Mở bản đồ</small></span></a></div>
  </div></footer>
);
