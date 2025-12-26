import React from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../../components/layout/StaffSidebar";
import Header from "../../components/layout/Header";
const Staff = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <StaffSidebar />
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
            marginTop: "60px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Staff;

