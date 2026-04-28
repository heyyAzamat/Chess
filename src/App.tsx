import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { NavBar } from "./components/nav/NavBar";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { ModeSelectPage } from "./pages/ModeSelectPage";
import { GamePage } from "./pages/GamePage";
import { CharactersPage } from "./pages/CharactersPage";
import { RatingPage } from "./pages/RatingPage";
import { FriendsPage } from "./pages/FriendsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShopPage } from "./pages/ShopPage";
import { OnlinePage } from "./pages/OnlinePage";
import "./App.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />

        <Route path="/"           element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/play"       element={<RequireAuth><ModeSelectPage /></RequireAuth>} />
        <Route path="/game"       element={<RequireAuth><GamePage /></RequireAuth>} />
        <Route path="/characters" element={<RequireAuth><CharactersPage /></RequireAuth>} />
        <Route path="/rating"     element={<RequireAuth><RatingPage /></RequireAuth>} />
        <Route path="/friends"    element={<RequireAuth><FriendsPage /></RequireAuth>} />
        <Route path="/settings"   element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/online"     element={<RequireAuth><OnlinePage /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {user && <NavBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
