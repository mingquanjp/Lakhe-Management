import React from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          
          <h1>Welcome to LaKhe Management</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
