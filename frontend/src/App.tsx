import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { JobsPage } from "./pages/JobsPage.tsx";
import { CandidatesPage } from "./pages/CandidatesPage.tsx";
import HomePage from "./pages/HomePage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="" element={<Navigate to="/dashboard" />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="jobs"
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="jobs/:jobId/candidates"
        element={
          <ProtectedRoute>
            <CandidatesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
