import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestAccountantDashboard from './pages/TestAccountantDashboard';
import FeeDetail from './pages/FeeDetails';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route để test dashboard content */}
          <Route path="/" element={<TestAccountantDashboard />} />
          <Route path="/test-dashboard" element={<TestAccountantDashboard />} />
          <Route path="/fee-detail/:feeId" element={<FeeDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
