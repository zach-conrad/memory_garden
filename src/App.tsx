import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";
import { AdminPage } from "./components/AdminPage";
import { TestPage } from "./components/TestPage";
import { LoadingScreen } from "./components/LoadingScreen";

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const path = window.location.pathname;

  if (loading) return <LoadingScreen />;
  if (!user) return <Landing onEnter={signInWithGoogle} />;

  if (path === "/admin") return <AdminPage />;
  if (path === "/tests") return <TestPage />;
  return <Garden />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}