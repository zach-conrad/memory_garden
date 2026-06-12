import { motion } from "framer-motion";
import type { Memory } from "../types/memory";

interface BlossomProps {
  memory: Memory;
  dimmed: boolean;
  onOpen: (memory: Memory) => void;
}

/** Deterministic pseudo-random number in [0, 1) derived from a string. */
function seeded(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const PETAL_COLORS = ["#e8a8bd", "#f0c75e", "#b7d4f0", "#d6b8ec", "#f0b48a"];

/**
 * A planted memory, rendered as a small procedurally-varied flower.
 * The same memory always grows the same flower (seeded by its id),
 * so the garden looks alive without storing any extra fields.
 */
export function Blossom({ memory, dimmed, onOpen }: BlossomProps) {
  const petals = 5 + Math.floor(seeded(memory.id, 1) * 3); // 5–7
  const color = PETAL_COLORS[Math.floor(seeded(memory.id, 2) * PETAL_COLORS.length)];
  const stem = 26 + seeded(memory.id, 3) * 22; // 26–48px
  const size = 9 + seeded(memory.id, 4) * 5; // petal length

  const cx = 30;
  const head = 16;

  return (
    <motion.button
      type="button"
      className={`blossom${dimmed ? " blossom--dim" : ""}`}
      style={{ left: memory.x, top: memory.y }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(memory);
      }}
      aria-label={`Open memory: ${memory.title}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.15 }}
    >
      <svg width={60} height={head + size + stem} aria-hidden="true">
        {/* stem */}
        <path
          d={`M ${cx} ${head + size + stem} q 4 ${-stem / 2} 0 ${-stem}`}
          stroke="#5d8a6c"
          strokeWidth={2}
          fill="none"
        />
        {/* leaf */}
        <ellipse
          cx={cx + 6}
          cy={head + size + stem * 0.6}
          rx={6}
          ry={3}
          fill="#5d8a6c"
          transform={`rotate(-30 ${cx + 6} ${head + size + stem * 0.6})`}
        />
        {/* petals */}
        <g className="blossom__glow">
          {Array.from({ length: petals }, (_, i) => {
            const angle = (i / petals) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={cx + Math.cos(angle) * size * 0.7}
                cy={head + Math.sin(angle) * size * 0.7}
                rx={size * 0.62}
                ry={size * 0.4}
                fill={color}
                opacity={0.92}
                transform={`rotate(${(angle * 180) / Math.PI} ${
                  cx + Math.cos(angle) * size * 0.7
                } ${head + Math.sin(angle) * size * 0.7})`}
              />
            );
          })}
          {/* center */}
          <circle cx={cx} cy={head} r={size * 0.38} fill="#f7e6b0" />
        </g>
      </svg>
      <span className="blossom__label">{memory.title}</span>
      <span className="blossom__desc">{memory.body}</span>
    </motion.button>
  );
}
