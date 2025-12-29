import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import {
  overView,
  People,
  Staff,
  Statistic,
  logoutIcon,
} from "../../assets/icons";
import { Button } from "../commons";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      id: "dashboards",
      label: "Dashboards",
      type: "section",
    },
    {
      id: "overview",
      label: "Tổng quan",
      icon: overView,
      path: "/admin/overview",
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
      id: "people",
      label: "Quản lý dân cư",
      icon: People,
      subItems: [
        { id: "household", label: "Quản lý hộ thường trú", path: "/admin/household" },
        { id: "householdtemporary", label: "Quản lý hộ tạm trú", path: "/admin/householdtemporary" },
        { id: "temporary-absence", label: "Quản lý tạm vắng", path: "/admin/temporary-absence" },
        { id: "history", label: "Lịch sử biến động", path: "/admin/history" },
        { id: "form", label: "Biểu mẫu khai báo", path: "/admin/form" },
      ],
    },

    {
      id: "stats",
      label: "Thống kê",
      icon: Statistic,
      subItems: [
        {
          id: "citizen-stats",
          label: "Thống kê nhân khẩu",
          path: "/admin/stats/citizen",
        },
        {
          id: "finance-stats",
          label: "Thống kê tài chính",
          path: "/admin/stats/finance",
        },
      ],
    },
    {
      id: "staff",
      label: "Quản lý cán bộ",
      icon: Staff,
      path: "/admin/accounts",
    },
  ];

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderIcon = (icon) => {
    if (!icon) return null;
    return <img src={icon} alt="" className="sidebar-icon-img" />;
  };

  const renderSubMenuItem = (subItem, level = 0) => {
    const hasChildren = subItem.subItems && subItem.subItems.length > 0;
    const isExpanded = expandedItems[subItem.id];
    const paddingLeft = `${48 + level * 16}px`;

    if (hasChildren) {
      return (
        <div key={subItem.id}>
          <button
            className="sidebar-subitem"
            style={{ paddingLeft, justifyContent: "space-between" }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(subItem.id);
            }}
          >
            <span>{subItem.label}</span>
            <span className={`sidebar-arrow ${isExpanded ? "expanded" : ""}`}>
              ›
            </span>
          </button>
          {isExpanded && (
            <div className="sidebar-submenu-nested">
              {subItem.subItems.map((child) =>
                renderSubMenuItem(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={subItem.id}
        className="sidebar-subitem"
        style={{ paddingLeft }}
        onClick={() => subItem.path && navigate(subItem.path)}
      >
        {subItem.label}
      </button>
    );
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

    return (
      <div key={item.id}>
        <button
          className="sidebar-item"
          onClick={() => {
            if (hasSubItems) {
              toggleExpand(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
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
            {item.subItems.map((subItem) => renderSubMenuItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <img src={logoutIcon} alt="logout" className="logout-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;