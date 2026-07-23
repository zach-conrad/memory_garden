/**
*
* Serves as the main entry point for the Memory Garden Application
*
* Initializes appliation-wide authentication and routes user to the appropriate interface
* i.e landing page, garden, admin panel
* or testing dashboard based on their authentication state and location
* @packageDocumentation
*/

import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";
import { AdminPage } from "./components/AdminPage";
import { TestPage } from "./components/TestPage";
import { LoadingScreen } from "./components/LoadingScreen";

/**
* Selects the page displayed by the application based on authentication
* state and the current browser path.
*
* @returns the loading screen, landing page, admin page, testing page,
* or main garden interface
*/

function AppContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const path = window.location.pathname;

  if (loading) return <LoadingScreen />;
  if (!user) return <Landing onEnter={signInWithGoogle} />;

  if (path === "/admin") return <AdminPage />;
  if (path === "/tests") return <TestPage />;
  return <Garden />;
}

/**
* Root component for MG application.
*
* Wraps the application in the authentication provider so child
* components can access the current user and authentication actions
*
* @returns the complete Memory Gardens React application
*/

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}