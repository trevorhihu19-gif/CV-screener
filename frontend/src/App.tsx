import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { JobsPage } from "./pages/JobsPage.tsx";
import { CandidatesPage } from "./pages/CandidatesPage.tsx";
import { ChatPage } from "./pages/ChatPage.tsx";
import SplashScreen from "./components/landing/SplashScreen.tsx";
import HomePage from "./pages/HomePage.tsx";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("seenSplash");

  if (hasSeenSplash) {
    setShowSplash(false);
    return;
  }
  const timer = window.setTimeout(() => {
    sessionStorage.setItem("seenSplash", "true");
    setShowSplash(false);
  }, 2500);

  return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <SignIn routing="path" path="/login" />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <SignUp routing="path" path="/register" />
          </div>
        }
      />
      <Route path="" element={<Navigate to="/home" />} />

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
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
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
