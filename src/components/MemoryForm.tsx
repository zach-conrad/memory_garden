/**
* 
* Provides the form used to create and plant new memories. 
*
* Collects user input for a memory, validates submitted data, and
* creates new public or private memories within the MG (Memory Garden) application
* @packageDocumentation
*/

import { useState } from "react";
import { motion } from "framer-motion";
import type { NewMemory } from "../types/memory";

export interface MemoryFormProps {
  /** World coordinates of the chosen planting spot. */
  spot: { x: number; y: number };
  onPlant: (input: NewMemory) => Promise<void>;
  onCancel: () => void;
  /** Starting state for the privacy toggle — matches whichever garden view was open when planting started. */
  defaultShared?: boolean;
}

/**
 * Memory creation form (WBS 3.4). Text-only for the MVP — image upload
 * arrives with Supabase Storage in Milestone 2 (WBS 4.4).
 */
export function MemoryForm({ spot, onPlant, onCancel, defaultShared = true }: MemoryFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isShared, setIsShared] = useState(defaultShared);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handlePlant() {
    if (!title.trim() || !body.trim()) {
      setError("A memory needs at least a title and a story.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onPlant({
        title: title.trim(),
        body: body.trim(),
        author: author.trim() || "Anonymous",
        x: spot.x,
        y: spot.y,
        image: imageFile, // pass selected file object to parent for Supabase upload
        isShared,
      });
    } catch {
      setError("The memory could not be planted. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="panel-backdrop" onClick={onCancel} onPointerDown={(e) => e.stopPropagation()}>
      <motion.div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Plant a memory"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <h2>Plant a memory</h2>
        <p className="panel__meta">It will grow right where you clicked.</p>

        <label htmlFor="mem-title">Title</label>
        <input
          id="mem-title"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The night we drove to the coast"
        />

        <label htmlFor="mem-body">The memory</label>
        <textarea
          id="mem-body"
          rows={5}
          value={body}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What happened, who was there, why it stays with you…"
        />

        <label htmlFor="mem-author">Your name (optional)</label>
        <input
          id="mem-author"
          value={author}
          maxLength={60}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonymous"
        />

        <label htmlFor="mem-img">Attach an image (optional)</label>
        <input
          id="mem-img"
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!["image/jpeg", "image/png"].includes(file.type)) {
              setError("Images must be a JPG or PNG file.");
              e.target.value = "";
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              setError("Images must be 5MB or smaller.");
              e.target.value = "";
              return;
            }
            setError(null);
            setImageFile(file);
          }}
        />

        <div className="privacy-toggle">
          <button
            type="button"
            role="switch"
            aria-checked={isShared}
            className={`privacy-toggle__switch${isShared ? " privacy-toggle__switch--on" : ""}`}
            onClick={() => setIsShared((v) => !v)}
          >
            <span className="privacy-toggle__thumb" />
          </button>
          <div>
            <p className="privacy-toggle__label">
              {isShared ? "Shared with the garden" : "Kept private"}
            </p>
            <p className="privacy-toggle__hint">
              {isShared
                ? "Every visitor can see this blossom."
                : "Only you will ever see this blossom."}
            </p>
          </div>
        </div>

        {error && <p className="panel__error">{error}</p>}

        <div className="panel__actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handlePlant}
            disabled={saving}
          >
            {saving ? "Planting…" : "Plant memory"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
