<<<<<<< HEAD
import React, { useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import HouseholdDetail from "./pages/HouseholdDetail";
import Declaration from "./pages/Declaration";

function App() {
  const [currentPath, setCurrentPath] = useState("/overview");

  const renderContent = () => {
    switch (currentPath) {
      case "/household":
        return <HouseholdDetail />;
      case "/form":
      case "/citizen":
        return <Declaration />;
      default:
        return <h1>Welcome to LaKhe Management</h1>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar onNavigate={setCurrentPath} />
      <div className="main-content">
        <Header />
        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
=======
import React from "react";
import Login from "./pages/Login";

function App() {
  return  <Login/>;
>>>>>>> develop
}

export default App;
