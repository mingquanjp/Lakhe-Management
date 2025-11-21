import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/households',
      label: 'Quản lý hộ khẩu',
      icon: '👥'
    },
    {
      path: '/fees',
      label: 'Quản lý phí',
      icon: '💰'
    },
    {
      path: '/reports',
      label: 'Báo cáo',
      icon: '📈'
    },
    {
      path: '/settings',
      label: 'Cài đặt',
      icon: '⚙️'
    }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;