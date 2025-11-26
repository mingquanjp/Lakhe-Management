import React from "react";
import StaffSidebar from "../../components/layout/StaffSidebar";
import Header from "../../components/layout/Header";
import FeeDashboard from "./FeeDashboard";
import FeeDetail from "./FeeDetail";
import TableFeeDetail from "./FeeDetail/TableFeeDetails";
import AccountantDashboard from "./FeeDashboard/AccountantDashboard";
const Staff = ({ currentPage, onPageChange, onLogout }) => {
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <FeeDashboard />;
      case "statistics":
        return <FeeDetail />;
      default:
        return <FeeDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <StaffSidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        onLogout={onLogout}
      />
      <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: "24px" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Staff;

