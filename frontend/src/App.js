import React, { useState } from "react";
import Login from "./pages/Login";
import Staff from "./pages/Staff";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Staff
      currentPage={currentPage}
      onPageChange={handlePageChange}
      onLogout={handleLogout}
    />
  );
}

export default App;
