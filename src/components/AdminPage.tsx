import { useEffect, useState } from "react";
import { listProfiles, listMemoriesForUser } from "../lib/adminStore";
import type { Profile } from "../types/profile";
import type { Memory } from "../types/memory";
import { useIsAdmin } from "../hooks/useIsAdmin";

export function AdminPage() {
  const { isAdmin, loading: checkingAdmin } = useIsAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    listProfiles()
      .then(setProfiles)
      .catch(() => setError("Could not load users."))
      .finally(() => setLoadingProfiles(false));
  }, [isAdmin]);

  async function selectUser(profile: Profile) {
    setSelected(profile);
    setError(null);
    setLoadingMemories(true);
    try {
      const data = await listMemoriesForUser(profile.id);
      setMemories(data);
    } catch {
      setError("Could not load memories for this user.");
    } finally {
      setLoadingMemories(false);
    }
  }

  if (checkingAdmin) return <div className="admin-page">Checking access…</div>;
  if (!isAdmin) return <div className="admin-page">You don't have access to this page.</div>;

  return (
    <div className="admin-page">
      <h1>Admin · Users</h1>
      {error && <p className="admin-page__error">{error}</p>}
      <div className="admin-page__layout">
        <ul className="admin-page__user-list">
          {loadingProfiles ? (
            <li>Loading users…</li>
          ) : (
            profiles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`admin-page__user-btn${
                    selected?.id === p.id ? " admin-page__user-btn--active" : ""
                  }`}
                  onClick={() => selectUser(p)}
                >
                  {p.avatarUrl && (
                    <img
                      src={p.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="admin-page__avatar"
                    />
                  )}
                  <span>{p.fullName ?? p.email ?? p.id}</span>
                  {p.isAdmin && <span className="admin-page__badge">admin</span>}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="admin-page__detail">
          {!selected ? (
            <p>Select a user to see their memories.</p>
          ) : loadingMemories ? (
            <p>Loading memories…</p>
          ) : memories.length === 0 ? (
            <p>{selected.fullName ?? selected.email} hasn't planted any memories.</p>
          ) : (
            <ul className="admin-page__memory-list">
              {memories.map((m) => (
                <li key={m.id}>
                  <h3>{m.title}</h3>
                  <p className="admin-page__memory-meta">
                    {new Date(m.createdAt).toLocaleDateString()} · by {m.author}
                  </p>
                  <p>{m.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}