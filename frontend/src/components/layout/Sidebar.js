import React, { useState } from "react";
import "./Sidebar.css";
import {
  overView,
  People,
  Staff,
  Statistic,
  logoutIcon,
} from "../../assets/icons";
import Button from "../commons/Button/Button";

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    {
      id: "dashboards",
      label: "Dashboards",
      type: "section",
    },
    {
      id: "overview",
      label: "Overview",
      icon: overView,
      path: "/overview",
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
        { id: "household", label: "Quản lý hộ khẩu", path: "/household" },
        { id: "citizen", label: "Quản lý nhân khẩu", path: "/citizen" },
        { id: "form", label: "Form khai báo", path: "/form" },
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
          path: "/stats/citizen",
        },
        {
          id: "finance-stats",
          label: "Thống kê tài chính",
          path: "/stats/finance",
        },
      ],
    },
    {
      id: "staff",
      label: "Quản lý cán bộ",
      icon: Staff,
      path: "/staff",
    },
  ];

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
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

    return (
      <div key={item.id}>
        <button
          className="sidebar-item"
          onClick={() => hasSubItems && toggleExpand(item.id)}
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
              <button key={subItem.id} className="sidebar-subitem">
                {subItem.label}
              </button>
            ))}
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
        <Button
          variant="primary"
          size="medium"
          className="sidebar-logout-btn"
          onClick={() => console.log("Logout clicked")}
        >
          <img src={logoutIcon} alt="logout" className="logout-icon" />
          <span>Log Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;