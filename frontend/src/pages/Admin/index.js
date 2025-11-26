import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PopulationDashboard from "./PopulationDashboard/PopulationDashboard";
import StaffManagement from "./StaffManagement/StaffManagement";
import Overview from "./Overview/Overview";
import HouseholdList from "./HouseholdList/HouseholdList";

const Admin = () => {
  const [currentPage, setCurrentPage] = useState("householdlist");

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add logout logic here
  };

  const renderPage = () => {
    switch (currentPage) {
      case "householdlist":
        return <HouseholdList/>;
      case "overview":
        return <Overview />;
      case "staff":
        return <StaffManagement />;
      default:
        return <PopulationDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />
      <div
        style={{
          marginLeft: "240px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: "24px",
            backgroundColor: "#f5f7fa",
            marginTop: "40px",
          }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Admin;
