import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-title">{title || 'Dashboard'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          {theme === 'dark' ? <FiSun style={{ color: '#FDCB6E' }} /> : <FiMoon style={{ color: '#6C5CE7' }} />}
        </button>

        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="navbar-user-info">
              <div className="name">{user.name}</div>
              <div className="role">{user.role === 'admin' ? 'Administrator' : 'Anggota'}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
