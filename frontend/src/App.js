import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login/Login";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import PopulationDashboard from "./pages/Admin/PopulationDashboard/PopulationDashboard";
import HouseholdDetail from "./pages/HouseholdDetail";
import Declaration from "./pages/Declaration";
import FormsMenu from "./pages/Admin/FormsMenu/FormsMenu";

// Import Forms
import NewHouseholdForm from "./pages/Admin/HouseholdForms/NewHouseholdForm";
import NewMemberForm from "./pages/Admin/HouseholdForms/NewMemberForm";
import MemberStatusChangeForm from "./pages/Admin/HouseholdForms/MemberStatusChangeForm";
import TemporaryResidenceForm from "./pages/Admin/HouseholdForms/TemporaryResidenceForm";
import ChangeOwnerForm from "./pages/Admin/HouseholdForms/ChangeOwnerForm/ChangeOwnerForm";

// Import Staff Pages - SỬA ĐỔI TẠI ĐÂY
import AccountantDashboard from "./pages/Staff/FeeDashboard/AccountantDashboard";
import TableFeeDetails from "./pages/Staff/FeeDetail/TableFeeDetails";
import FeeDashboard from "./pages/Staff/FeeDashboard/FeeDashboard"; // Giữ lại nếu cần
import FeeDetail from "./pages/Staff/FeeDetail/FeeDetail"; // Giữ lại nếu cần

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
        <Route index element={<PopulationDashboard />} />
        <Route path="overview" element={<PopulationDashboard />} />
        <Route path="household" element={<HouseholdDetail />} />
        <Route path="citizen" element={<Declaration />} />
        <Route path="form" element={<FormsMenu />} />
        <Route path="form/new-household-form" element={<NewHouseholdForm />} />
        <Route path="form/new-member-form" element={<NewMemberForm />} />
        <Route path="form/member-status-change-form" element={<MemberStatusChangeForm />} />
        <Route path="form/temporary-residence-form" element={<TemporaryResidenceForm />} />
        <Route path="form/change-owner-form" element={<ChangeOwnerForm />} />
      </Route>

      {/* Staff Routes - Protected - SỬA ĐỔI TẠI ĐÂY */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute requiredRole="staff">
            <Staff />
          </ProtectedRoute>
        }
      >
        {/* Trang mặc định khi vào /staff */}
        <Route index element={<FeeDashboard />} />
        
        {/* Route cho "Quản lý đợt thu" - AccountantDashboard */}
        <Route path="fee-management" element={<AccountantDashboard />} />
        
        {/* Route cho "Chi tiết các đợt thu" - TableFeeDetails */}
        <Route path="table-detail" element={<TableFeeDetails />} />
        
        {/* Route cho chi tiết một khoản thu cụ thể (với :feeId) */}
        <Route path="fee-detail/:feeId" element={<TableFeeDetails />} />
        
        {/* Route cũ - giữ lại để tương thích */}
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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;