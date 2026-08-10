import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid,
  FiBox,
  FiCalendar,
  FiUsers,
  FiClock,
  FiFileText,
  FiUser,
  FiLogOut,
  FiShoppingBag,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🎭</div>
        <div>
          <h2>Rental Kostum</h2>
          <span>Smart & Interactive</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <div className="sidebar-section-title">Admin Panel</div>
            <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiGrid />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/units" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiBox />
              <span>Kelola Unit Kostum</span>
            </NavLink>
            <NavLink to="/admin/events" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiCalendar />
              <span>Kelola Event</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiUsers />
              <span>Kelola User</span>
            </NavLink>
            <NavLink to="/admin/borrowings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiClock />
              <span>Peminjaman Aktif</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiFileText />
              <span>Laporan Riwayat</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="sidebar-section-title">Menu Anggota</div>
            <NavLink to="/catalog" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiShoppingBag />
              <span>Katalog Kostum</span>
            </NavLink>
            <NavLink to="/my-borrowings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiClock />
              <span>Peminjaman Saya</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FiUser />
              <span>Profil Saya & Body Size</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', color: 'var(--danger)', border: 'none', background: 'transparent' }}>
          <FiLogOut />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
