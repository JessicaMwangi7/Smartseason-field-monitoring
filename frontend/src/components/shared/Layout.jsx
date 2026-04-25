import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isAdmin = user?.role === 'admin';
  const navLinks = isAdmin
    ? [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/fields', label: 'Fields' },
        { to: '/admin/agents', label: 'Agents' },
      ]
    : [
        { to: '/agent/dashboard', label: 'Dashboard' },
        { to: '/agent/fields', label: 'My Fields' },
      ];

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <span>🌿</span>
          <span>SmartSeason</span>
        </div>
        <div className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
