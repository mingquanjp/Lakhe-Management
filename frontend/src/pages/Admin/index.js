import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

const Admin = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
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

export default Admin;
