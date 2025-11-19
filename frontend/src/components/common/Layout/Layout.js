import React from 'react';
import Header from '../Header/Header'; // Import Header từ thư mục components
import Sidebar from '../Sidebar/Sidebar'; // Import Sidebar từ thư mục components
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Header */}
      <Header />

      <div className="layout-body">
        {/* Sidebar */}
        <Sidebar />

        {/* Nội dung chính */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;