import "./Header.css";
import React, { useState } from "react";
import logoLK from "../../assets/images/logoLK.png";
import {
  toggleIcon,
  searchIcon
} from "../../assets/icons";
import { Button } from "../commons";

const Header = () => {
  const [searchValue, setSearchValue] = useState("");

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
        <div className="search-container">
          <img src={searchIcon} alt="Search" className="search-icon-img" />
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <span className="search-shortcut">/</span>
        </div>

        <div className="user-info">
          <span className="user-name">Minh Quân</span>
          <div className="user-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Minh+Quan&background=4A90E2&color=fff&size=48"
              alt="User Avatar"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
