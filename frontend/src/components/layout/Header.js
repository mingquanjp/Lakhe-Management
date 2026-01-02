import "./Header.css";
import React from "react";
import logoLK from "../../assets/images/logoLK.png";
import { toggleIcon } from "../../assets/icons";
import { Button } from "../commons";
import { useAuth } from "../../context/AuthContext";

// Hàm lấy chữ cái đầu và cuối từ họ tên
const getInitials = (fullName) => {
  if (!fullName) return "U";
  
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  
  // Lấy chữ cái đầu tiên của họ và chữ cái đầu tiên của tên
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
};

const Header = () => {
  const { user } = useAuth();
  
  // Lấy thông tin user
  const displayName = user?.full_name || "Người dùng";
  const initials = getInitials(displayName);

  return (
    <header className="header">
      <div className="header-left">
        <Button
          variant="outline"
          size="small"
          className="menu-toggle"
          aria-label="Toggle menu"
        >
          <img src={toggleIcon} alt="Menu" className="icon-img" />
        </Button>
        <nav className="header-nav">
          <a href="/" className="nav-item">
            Dashboards
          </a>
          <span className="nav-separator">/</span>
          <a href="/" className="nav-item active">
            Default
          </a>
        </nav>
      </div>

      <div className="header-center">
        <img src={logoLK} alt="LaKhe Logo" className="header-logo" />
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{displayName}</span>
          <div className="user-avatar">
            <span className="avatar-initials">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
