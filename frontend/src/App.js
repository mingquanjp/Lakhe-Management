import React from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import HouseholdList from "./pages/HouseholdList/HouseholdList";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <HouseholdList />
        </div>
      </div>
    </div>
  );
}

export default App;
