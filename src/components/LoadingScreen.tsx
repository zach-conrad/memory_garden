import { motion } from "framer-motion";

const PETAL_COLORS = ["#e8a8bd", "#f0c75e", "#b7d4f0", "#d6b8ec", "#f0b48a"];

/** Full-screen loading state: a flower blooms petal by petal while the app checks auth. */
export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Loading">
      <svg width={96} height={132} viewBox="0 0 96 132" aria-hidden="true">
        <motion.path
          d="M 48 128 Q 52 88 48 56"
          stroke="#5d8a6c"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.ellipse
          cx={58}
          cy={92}
          rx={9}
          ry={4.5}
          fill="#5d8a6c"
          transform="rotate(-25 58 92)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          style={{ transformOrigin: "58px 92px" }}
        />
        <g>
          {PETAL_COLORS.map((color, i) => {
            const angle = (i / PETAL_COLORS.length) * Math.PI * 2 - Math.PI / 2;
            const cx = 48 + Math.cos(angle) * 12;
            const cy = 44 + Math.sin(angle) * 12;
            return (
              <motion.ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={10}
                ry={6.5}
                fill={color}
                transform={`rotate(${(angle * 180) / Math.PI} ${cx} ${cy})`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.15, 1], opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.9 + i * 0.12,
                  repeat: Infinity,
                  repeatDelay: PETAL_COLORS.length * 0.12 + 1.4,
                  ease: "easeOut",
                }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            );
          })}
          <motion.circle
            cx={48}
            cy={44}
            r={7}
            fill="#f7e6b0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          />
        </g>
      </svg>
      <motion.p
        className="loading-screen__text"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Tending the garden…
      </motion.p>
    </div>
  );
}
