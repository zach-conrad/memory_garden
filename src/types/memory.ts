/**
 * A memory planted in the garden.
 *
 * `x` and `y` are world coordinates inside the shared 2D garden,
 * not screen pixels — the garden viewport pans over this space.
 */
export interface Memory {
  id: string;
  title: string;
  body: string;
  author: string;
  /** World x coordinate (0 .. WORLD_WIDTH). */
  x: number;
  /** World y coordinate (0 .. WORLD_HEIGHT). */
  y: number;
  createdAt: string; // ISO timestamp
}

/** Fields a user supplies when planting; everything else is derived. */
export type NewMemory = Omit<Memory, "id" | "createdAt">;

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 3000;
