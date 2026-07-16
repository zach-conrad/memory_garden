import { motion } from "framer-motion";
import type { Memory } from "../types/memory";

interface MemoryViewProps {
  memory: Memory;
  onClose: () => void;
}

/** Memory viewing interface (WBS 3.5). */
export function MemoryView({ memory, onClose }: MemoryViewProps) {
  const planted = new Date(memory.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="panel-backdrop" onClick={onClose} onPointerDown={(e) => e.stopPropagation()}>
      <motion.div
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={memory.title}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <h2>{memory.title}</h2>
        <p className="panel__meta">
          Planted by {memory.author} · {planted}
        </p>

	{typeof memory.image === "string" && memory.image && (
		<img
			className="panel_image"
			src={memory.image}
			alt={'Attached to ${memory.title}'}
		/>
	)}

        <p className="panel__body">{memory.body}</p>
        <div className="panel__actions">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Back to the garden
          </button>
        </div>
      </motion.div>
    </div>
  );
}
