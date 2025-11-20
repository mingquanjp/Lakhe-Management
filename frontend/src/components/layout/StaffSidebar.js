import React, { useState } from "react";
import "./StaffSidebar.css";
import {
  overView,
  Statistic,
  logoutIcon,
} from "../../assets/icons";
import { Button } from "../commons";

const StaffSidebar = ({ currentPage, onPageChange, onLogout }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      id: "dashboards",
      label: "Dashboard",
      type: "section",
    },
    {
      id: "overview",
      label: "Tổng Quan",
      icon: overView,
      page: "dashboard",
    },
    {
      id: "divider1",
      type: "divider",
    },
    {
      id: "pages",
      label: "Pages",
      type: "section",
    },
    {
      id: "fee-management",
      label: "Quản lý thu phí",
      icon: overView,
      page: "fee-management",
    },
    {
      id: "statistics",
      label: "Thống kê",
      icon: Statistic,
      page: "statistics",
    },
  ];

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleItemClick = (item) => {
    if (item.page) {
      onPageChange(item.page);
    } else if (item.subItems) {
      toggleExpand(item.id);
    }
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    return <img src={icon} alt="" className="sidebar-icon-img" />;
  };

  const renderMenuItem = (item) => {
    if (item.type === "section") {
      return (
        <div key={item.id} className="sidebar-section">
          {item.label}
        </div>
      );
    }

    if (item.type === "divider") {
      return <div key={item.id} className="sidebar-divider" />;
    }

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.id];
    const isActive = item.page === currentPage;

    return (
      <div key={item.id}>
        <button
          className={`sidebar-item ${isActive ? "active" : ""}`}
          onClick={() => handleItemClick(item)}
        >
          <span className="sidebar-icon">{renderIcon(item.icon)}</span>
          <span className="sidebar-label">{item.label}</span>
          {hasSubItems && (
            <span className={`sidebar-arrow ${isExpanded ? "expanded" : ""}`}>
              ›
            </span>
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="sidebar-submenu">
            {item.subItems.map((subItem) => (
              <button
                key={subItem.id}
                className="sidebar-subitem"
                onClick={() => subItem.page && onPageChange(subItem.page)}
              >
                {subItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="sidebar staff-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
      <div className="sidebar-footer">
        <Button
          variant="primary"
          size="medium"
          className="sidebar-logout-btn"
          onClick={onLogout}
        >
          <img src={logoutIcon} alt="logout" className="logout-icon" />
          <span>Log Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default StaffSidebar;

