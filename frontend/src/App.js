import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login/Login";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import PopulationDashboard from "./pages/Admin/PopulationDashboard/PopulationDashboard";
import StatsFinanceDashboard from "./pages/Admin/StatsFinanceDashboard/StatsFinanceDashboard";
import HouseholdDetail from "./pages/Admin/HouseholdList/HouseholdDetail";
import Declaration from "./pages/Declaration";
import FormsMenu from "./pages/Admin/FormsMenu/FormsMenu";
import Overview from "./pages/Admin/Overview/Overview";
import HistoryList from "./pages/Admin/History/HistoryList";
import HistoryDetail from "./pages/Admin/History/HistoryDetail";

// Import Forms
import NewHouseholdForm from "./pages/Admin/HouseholdForms/NewHouseholdForm";
import NewMemberForm from "./pages/Admin/HouseholdForms/NewMemberForm";
import MemberStatusChangeForm from "./pages/Admin/HouseholdForms/MemberStatusChangeForm";
import TemporaryResidenceForm from "./pages/Admin/HouseholdForms/TemporaryResidenceForm";
import ChangeOwnerForm from "./pages/Admin/HouseholdForms/ChangeOwnerForm/ChangeOwnerForm";
import HouseholdList from "./pages/Admin/HouseholdList/HouseholdList";
import HouseholdTemporaryList from "./pages/Admin/HouseholdTemporaryList/HouseholdTemporaryList";
import TemporaryAbsenceList from "./pages/Admin/TemporaryAbsenceList/TemporaryAbsenceList";


// Import Staff Pages
import FeeDashboard from "./pages/Staff/FeeDashboard/FeeDashboard";
import FeeDetail from "./pages/Staff/FeeDetail/FeeDetail";

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === "staff") {
    return <Navigate to="/staff" replace />;
  }

  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="overview" element={<Overview />} />
        <Route path="household" element={<HouseholdList />} />
        <Route path="household/:id" element={<HouseholdDetail />} />
        <Route path="householdtemporary" element={<HouseholdTemporaryList />} />
        <Route path="householdtemporary/:id" element={<HouseholdDetail />} />
        <Route path="temporary-absence" element={<TemporaryAbsenceList />} />
        <Route path="history" element={<HistoryList />} />
        <Route path="history/:id" element={<HistoryDetail />} />
        <Route path="stats/citizen" element={<PopulationDashboard />} />
        <Route path="stats/finance" element={<StatsFinanceDashboard />} />
        <Route path="citizen" element={<Declaration />} />
        <Route path="form" element={<FormsMenu />} />
        <Route path="form/new-household-form" element={<NewHouseholdForm />} />
        <Route path="form/new-member-form" element={<NewMemberForm />} />
        <Route
          path="form/member-status-change-form"
          element={<MemberStatusChangeForm />}
        />
        <Route
          path="form/temporary-residence-form"
          element={<TemporaryResidenceForm />}
        />
        <Route path="form/change-owner-form" element={<ChangeOwnerForm />} />
      </Route>

      {/* Staff Routes - Protected */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredRole="staff">
            <Staff />
          </ProtectedRoute>
        }
      >
        <Route index element={<FeeDashboard />} />
        <Route path="fee-detail" element={<FeeDetail />} />
      </Route>

      {/* Fallback - redirect to root which will handle auth */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="bottom-right" autoClose={3000} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;