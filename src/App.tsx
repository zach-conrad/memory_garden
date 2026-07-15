import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";
import { AdminPage } from "./components/AdminPage";

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const isAdminRoute = window.location.pathname === "/admin";

  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Landing onEnter={signInWithGoogle} />;

  return isAdminRoute ? <AdminPage /> : <Garden />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}