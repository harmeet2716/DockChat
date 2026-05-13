import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import LandingPage from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SetupProfile } from "./pages/SetupProfile";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Force profile setup if not complete
  if (user && !user.isProfileComplete && window.location.pathname !== "/setup-profile") {
    return <Navigate to="/setup-profile" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/setup-profile" element={<SetupProfile />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
