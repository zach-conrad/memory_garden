import { useState } from "react";
import { Landing } from "./components/Landing";
import { Garden } from "./components/Garden";

/**
 * Application root. Two views for the MVP:
 * the landing page, and the garden itself.
 */
export default function App() {
  const [entered, setEntered] = useState(false);
  return entered ? <Garden /> : <Landing onEnter={() => setEntered(true)} />;
}
