import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) return <div className="app-loading">Loading…</div>;

  return user ? <Garden /> : <Landing onEnter={signInWithGoogle} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}