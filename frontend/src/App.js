import React from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview/Overview";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <Overview/>
        </div>
      </div>
    </div>
  );
}

export default App;
