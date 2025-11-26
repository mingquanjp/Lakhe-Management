import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestAccountantDashboard from './pages/TestAccountantDashboard';
import FeeDetail from './pages/FeeDetails';
import Layout from './components/layout/Layout';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
      <div className="App">
        <Routes>
          <Route path="/" element={<TestAccountantDashboard />} />
          <Route path="/test-dashboard" element={<TestAccountantDashboard />} />
          <Route path="/fee-detail/:feeId" element={<FeeDetail />} />
        </Routes>
      </div>
      </Layout>
    </Router>
  );
}

export default App;
