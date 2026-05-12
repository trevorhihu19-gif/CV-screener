import { Route, Routes, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { JobsPage } from "./pages/JobsPage.tsx";
import { CandidatesPage } from "./pages/CandidatesPage.tsx";

function App() {
  return (
    <Routes>
      <Route path="" element={<Navigate to="/dashboard"/>} />
      <Route path="login" element={<LoginPage />}/>
      <Route path="register" element={<RegisterPage />}/>
      <Route path="dashboard" element={<DashboardPage />}/>
      <Route path="jobs" element={<JobsPage />}/>
      <Route path="jobs/:jobId/candidates" element={<CandidatesPage />}/>
    </Routes>
  );
}

export default App;
