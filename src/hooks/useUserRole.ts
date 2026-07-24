/**
*
* Retrieves the authenticated user's role and access permissions. 
*
* Determines the current user's role and provides role-based access
* infromation for administrative and testing features within the 
* Memory Garden
* @packageDocumentation
*/

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Role } from "../types/profile";

/** The signed-in user's role: 'admin' unlocks /admin and /tests, 'tester' only /tests. */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user || !supabase) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        setRole(!error ? ((data?.role as Role) ?? null) : null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    role,
    isAdmin: role === "admin",
    canAccessTests: role === "admin" || role === "tester",
    loading,
  };
}
