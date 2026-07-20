import { useCallback, useMemo, useRef, useState } from "react";
import { useMemories } from "../hooks/useMemories";
import { isShared } from "../lib/store";
import { WORLD_HEIGHT, WORLD_WIDTH, type Memory, type NewMemory } from "../types/memory";
import { Blossom } from "./Blossom";
import { MemoryForm } from "./MemoryForm";
import { MemoryView } from "./MemoryView";
import { AccountBadge } from "./AccountBadge";

const DRAG_THRESHOLD = 6; // px of movement before a press counts as a pan

/**
 * The garden itself (WBS 3.2 / 3.3 / 3.6): a 2D world the visitor
 * pans across by dragging. Clicking open ground plants a memory at
 * that spot; clicking a blossom opens it. The search field dims
 * non-matching blossoms instead of hiding them, so the garden's
 * geography stays stable while you look.
 */
export function Garden() {
  const { memories, loading, error, plant } = useMemories();

  // Viewport offset: world is translated by this amount.
  const [offset, setOffset] = useState(() => ({
    x: -(WORLD_WIDTH / 2) + window.innerWidth / 2,
    y: -(WORLD_HEIGHT / 2) + window.innerHeight / 2,
  }));
  const [dragging, setDragging] = useState(false);

  const [plantingSpot, setPlantingSpot] = useState<{ x: number; y: number } | null>(null);
  const [openMemory, setOpenMemory] = useState<Memory | null>(null);
  const [query, setQuery] = useState("");
  // Which memories are on view: your own private ones, or everyone's shared ones.
  const [viewMode, setViewMode] = useState<"private" | "shared">("shared");

  const drag = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    onBlossom: boolean;
  } | null>(null);

  const clamp = (x: number, y: number) => ({
    x: Math.min(80, Math.max(window.innerWidth - WORLD_WIDTH - 80, x)),
    y: Math.min(80, Math.max(window.innerHeight - WORLD_HEIGHT - 80, y)),
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      //catch if they clicked any topbar items to disable memory-form popup
      const isTopbarItem = !!(e.target as HTMLElement).closest(".garden__name") ||
                           !!(e.target as HTMLElement).closest(".garden__search") ||
                           !!(e.target as HTMLElement).closest(".garden__count") ||
                           !!(e.target as HTMLElement).closest(".view-toggle") ||
                           !!(e.target as HTMLElement).closest(".account-badge");
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: offset.x,
        originY: offset.y,
        moved: false,

        //if it's a topbar item, treat as protected like a blossom
        onBlossom: !!(e.target as HTMLElement).closest(".blossom") || isTopbarItem,
      };
      // Keep receiving move events even if the pointer leaves the element.
      // Guarded because jsdom (used by Vitest) doesn't implement it.
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [offset],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) {
      setOffset(clamp(d.originX + dx, d.originY + dy));
    }
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      drag.current = null;
      setDragging(false);
      if (!d || d.moved || d.onBlossom) return;

      // A clean click on open ground: convert screen → world coordinates.
      const worldX = e.clientX - offset.x;
      const worldY = e.clientY - offset.y;
      if (worldX < 0 || worldY < 0 || worldX > WORLD_WIDTH || worldY > WORLD_HEIGHT) return;
      setPlantingSpot({ x: worldX, y: worldY });
    },
    [offset],
  );

  const handlePlant = useCallback(
    async (input: NewMemory) => {
      await plant(input);
      setPlantingSpot(null);
    },
    [plant],
  );

  // A memory shows up in exactly one view: private ones only in "private",
  // shared ones only in "shared" — never both, regardless of who planted it.
  const visibleMemories = useMemo(
    () => memories.filter((m) => (viewMode === "shared" ? m.isShared : !m.isShared)),
    [memories, viewMode],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      visibleMemories
        .filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.body.toLowerCase().includes(q) ||
            m.author.toLowerCase().includes(q),
        )
        .map((m) => m.id),
    );
  }, [visibleMemories, query]);

  return (
    <div
      className={`garden${dragging ? " garden--dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      data-testid="garden"
    >
      <header className="garden__topbar">
        <span className="garden__name">Memory Gardens</span>
        <input
          className="garden__search"
          type="search"
          placeholder="Search memories…"
          aria-label="Search memories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
        />
        <div className="garden__topbar-right" onPointerDown={(e) => e.stopPropagation()}>
          <div className="view-toggle" role="tablist" aria-label="Garden view">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "private"}
              className={`view-toggle__btn${viewMode === "private" ? " view-toggle__btn--active" : ""}`}
              onClick={() => setViewMode("private")}
            >
              🔒 My Garden
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "shared"}
              className={`view-toggle__btn${viewMode === "shared" ? " view-toggle__btn--active" : ""}`}
              onClick={() => setViewMode("shared")}
            >
              🌍 Shared Garden
            </button>
          </div>
          <span className="garden__count">
            {visibleMemories.length} {visibleMemories.length === 1 ? "memory" : "memories"}
            {isShared ? "" : " · local garden"}
          </span>
          <AccountBadge />
        </div>
      </header>

      <div
        className="garden__world"
        style={{
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {visibleMemories.map((m) => (
          <Blossom
            key={m.id}
            memory={m}
            dimmed={matches !== null && !matches.has(m.id)}
            onOpen={setOpenMemory}
          />
        ))}
      </div>

      <div className="garden__helper" role="status">
        {loading
          ? "Tending the garden…"
          : error
            ? error
            : visibleMemories.length === 0
              ? viewMode === "private"
                ? "No private memories yet. Click anywhere to plant one — only you will see it."
                : "No shared memories yet. Click anywhere to plant one for everyone."
              : "Drag to wander · click open ground to plant"}
      </div>

      {plantingSpot && (
        <MemoryForm
          spot={plantingSpot}
          onPlant={handlePlant}
          onCancel={() => setPlantingSpot(null)}
          defaultShared={viewMode === "shared"}
        />
      )}

      {openMemory && <MemoryView memory={openMemory} onClose={() => setOpenMemory(null)} />}
    </div>
  );
}
