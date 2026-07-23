/**
*
* Displays the application's landing page and sign-in screen.
*
* Presents an introduction to Memory Gardens and provides users with
* an entry point to authenticate and begin exploring the garden. 
* @packageDocumentation
*/


import { motion } from "framer-motion";

export interface LandingProps {
  onEnter: () => void;
}

/**
 * Landing page (WBS 3.1). One job: invite the visitor into the garden.
 */
export function Landing({ onEnter }: LandingProps) {
  return (
    <main className="landing">
      <motion.p
        className="landing__eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Memory Gardens
      </motion.p>

      <motion.h1
        className="landing__title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Memories aren&rsquo;t filed. <em>They&rsquo;re planted.</em>
      </motion.h1>

      <motion.p
        className="landing__sub"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        Wander a shared garden where every blossom holds a moment someone
        chose to keep. Plant your own, and leave it glowing for the next
        visitor to find.
      </motion.p>

      <motion.button
        className="landing__cta"
        onClick={onEnter}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Sign in with Google to enter
      </motion.button>

      <motion.p
        className="landing__hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        Drag to wander &middot; click open ground to plant
      </motion.p>
    </main>
  );
}
