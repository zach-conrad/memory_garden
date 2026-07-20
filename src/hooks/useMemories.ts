import { useCallback, useEffect, useState } from "react";
import { repo } from "../lib/store";
import type { Memory, NewMemory } from "../types/memory";
import { useAuth } from "../context/AuthContext";

/**
 * Loads the garden's memories and exposes a `plant` action.
 * Components stay unaware of where data lives (local vs Supabase).
 */
export function useMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    repo
      .list(user?.id ?? null)
      .then((list) => {
        if (!cancelled) setMemories(list);
      })
      .catch(() => {
        if (!cancelled) setError("The garden could not be loaded. Refresh to try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const plant = useCallback(async (input: NewMemory) => {
    const memory = await repo.add(input);
    setMemories((prev) => [...prev, memory]);
    return memory;
  }, []);

  return { memories, loading, error, plant };
}