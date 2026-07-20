import { useEffect, useState } from "react";
import {
  listProfiles,
  listMemoriesForUser,
  deleteMemory,
  addMemoryForUser,
} from "../lib/adminStore";
import type { Profile } from "../types/profile";
import type { Memory } from "../types/memory";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { LoadingScreen } from "./LoadingScreen";

export function AdminPage() {
  const { isAdmin, loading: checkingAdmin } = useIsAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setShowAddForm(false);
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

  async function handleDelete(memoryId: string) {
    if (!confirm("Delete this memory permanently?")) return;
    setDeletingId(memoryId);
    setError(null);
    try {
      await deleteMemory(memoryId);
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    } catch {
      setError("Could not delete that memory.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdd() {
    if (!selected) return;
    if (!newTitle.trim() || !newBody.trim()) {
      setError("A title and story are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const memory = await addMemoryForUser(selected.id, {
        title: newTitle.trim(),
        body: newBody.trim(),
        author: newAuthor.trim() || selected.fullName || "Anonymous",
      });
      setMemories((prev) => [...prev, memory]);
      setNewTitle("");
      setNewBody("");
      setNewAuthor("");
      setShowAddForm(false);
    } catch {
      setError("Could not add that memory.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingAdmin) return <LoadingScreen />;

  if (!isAdmin) {
    return (
      <div className="restricted">
        <div className="restricted__card">
          <span className="restricted__icon" aria-hidden="true">
            🔒
          </span>
          <h1>This patch is off-limits</h1>
          <p>You don&rsquo;t have admin access, so there&rsquo;s nothing to tend here.</p>
          <a className="btn btn--primary" href="/">
            Back to the garden
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Admin</p>
          <h1>Gardeners &amp; their memories</h1>
        </div>
        <a className="admin-page__back" href="/">
          ← Back to the garden
        </a>
      </header>

      {error && <p className="admin-page__error">{error}</p>}

      <div className="admin-page__layout">
        <ul className="admin-page__user-list">
          {loadingProfiles ? (
            <li className="admin-page__empty">Loading users…</li>
          ) : profiles.length === 0 ? (
            <li className="admin-page__empty">No users yet.</li>
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
            <div className="admin-page__empty admin-page__empty--panel">
              <span aria-hidden="true">🌱</span>
              <p>Select a gardener to see what they&rsquo;ve planted.</p>
            </div>
          ) : (
            <>
              <div className="admin-page__detail-header">
                <div>
                  <h2>{selected.fullName ?? selected.email}</h2>
                  <p className="admin-page__detail-count">
                    {memories.length} {memories.length === 1 ? "memory" : "memories"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setShowAddForm((v) => !v)}
                >
                  {showAddForm ? "Cancel" : "+ Add memory"}
                </button>
              </div>

              {showAddForm && (
                <div className="admin-page__add-form">
                  <label htmlFor="admin-title">Title</label>
                  <input
                    id="admin-title"
                    value={newTitle}
                    maxLength={80}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <label htmlFor="admin-body">Story</label>
                  <textarea
                    id="admin-body"
                    rows={4}
                    value={newBody}
                    maxLength={2000}
                    onChange={(e) => setNewBody(e.target.value)}
                  />
                  <label htmlFor="admin-author">Author (optional)</label>
                  <input
                    id="admin-author"
                    value={newAuthor}
                    maxLength={60}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={selected.fullName ?? "Anonymous"}
                  />
                  <div className="panel__actions">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleAdd}
                      disabled={saving}
                    >
                      {saving ? "Planting…" : "Plant for this user"}
                    </button>
                  </div>
                </div>
              )}

              {loadingMemories ? (
                <p className="admin-page__empty">Loading memories…</p>
              ) : memories.length === 0 ? (
                <p className="admin-page__empty">No memories yet.</p>
              ) : (
                <ul className="admin-page__memory-list">
                  {memories.map((m) => (
                    <li key={m.id} className="admin-page__memory-card">
                      <div className="admin-page__memory-row">
                        <h3>{m.title}</h3>
                        <button
                          type="button"
                          className="admin-page__delete-btn"
                          onClick={() => handleDelete(m.id)}
                          disabled={deletingId === m.id}
                        >
                          {deletingId === m.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                      <p className="admin-page__memory-meta">
                        {new Date(m.createdAt).toLocaleDateString()} · by {m.author} ·{" "}
                        <span className={`privacy-badge${m.isShared ? "" : " privacy-badge--private"}`}>
                          {m.isShared ? "🌍 Shared" : "🔒 Private"}
                        </span>
                      </p>
                      <p>{m.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}