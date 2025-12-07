import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Admin from "./pages/Admin";
import PopulationDashboard from "./pages/Admin/PopulationDashboard/PopulationDashboard";
import Declaration from "./pages/Declaration";
import FormsMenu from "./pages/Admin/FormsMenu/FormsMenu";

// Import Forms
import NewHouseholdForm from "./pages/Admin/HouseholdForms/NewHouseholdForm";
import NewMemberForm from "./pages/Admin/HouseholdForms/NewMemberForm";
import MemberStatusChangeForm from "./pages/Admin/HouseholdForms/MemberStatusChangeForm";
import TemporaryResidenceForm from "./pages/Admin/HouseholdForms/TemporaryResidenceForm";
import ChangeOwnerForm from "./pages/Admin/HouseholdForms/ChangeOwnerForm/ChangeOwnerForm";
import Overview from "./pages/Admin/Overview/Overview";
import HouseholdList from "./pages/Admin/HouseholdList/HouseholdList";
import HouseholdTemporaryList from "./pages/Admin/HouseholdTemporaryList/HouseholdTemporaryList";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Admin />}>
          {/* Dashboard */}
          <Route path="/" element={<PopulationDashboard />} />
          <Route path="/overview" element={<Overview/>} />

          {/* Main Pages */}
          <Route path="/household" element={<HouseholdList />} />
          <Route path="/householdtemporary" element={<HouseholdTemporaryList/>} />
          <Route path="/citizen" element={<Declaration />} />
          <Route path="/form" element={<FormsMenu />} />

          {/* Forms */}
          <Route path="/form/new-household-form" element={<NewHouseholdForm />} />
          <Route path="/form/new-member-form" element={<NewMemberForm />} />
          <Route
            path="/form/member-status-change-form"
            element={<MemberStatusChangeForm />}
          />
          <Route
            path="/form/temporary-residence-form"
            element={<TemporaryResidenceForm />}
          />
          <Route
            path="/form/change-owner-form"
            element={<ChangeOwnerForm />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;