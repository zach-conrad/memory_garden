import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";
import { AdminPage } from "./components/AdminPage";
import { LoadingScreen } from "./components/LoadingScreen";

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const isAdminRoute = window.location.pathname === "/admin";

  if (loading) return <LoadingScreen />;
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