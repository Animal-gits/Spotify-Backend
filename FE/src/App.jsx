import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AppShell from "./components/AppShell";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import AlbumPage from "./pages/AlbumPage";
import AlbumsPage from "./pages/AlbumsPage";
import ArtistDashboard from "./pages/ArtistDashboard";
import AuthPage from "./pages/AuthPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import TrackPage from "./pages/TrackPage";

function LandingRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader"><span className="brand-mark" />Loading Pavi…</div>;
  return <Navigate to={user ? (user.role === "artist" ? "/artist" : "/home") : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<RoleRoute role="user" />}>
            <Route path="/home" element={<ExplorePage />} />
          </Route>
          <Route element={<RoleRoute role="artist" />}>
            <Route path="/artist" element={<ArtistDashboard />} />
          </Route>
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
          <Route path="/tracks/:musicId" element={<TrackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<LandingRedirect />} />
    </Routes>
  );
}
