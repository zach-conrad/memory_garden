import { supabase } from "./supabase";
import type { Memory, NewMemory } from "../types/memory";

/**
 * Storage layer for memories.
 *
 * The app talks only to this interface, so swapping local storage for
 * Supabase (Milestone 2 / WBS 4.5) requires zero component changes —
 * the repo is chosen automatically based on whether `.env` is filled in.
 */
export interface MemoryRepo {
  list(): Promise<Memory[]>;
  add(input: NewMemory): Promise<Memory>;
}

const LOCAL_KEY = "memory-gardens:memories";

function makeMemory(input: NewMemory): Memory {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

/** Milestone 1: text-only, persists in this browser via localStorage. */
const localRepo: MemoryRepo = {
  async list() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as Memory[]) : [];
    } catch {
      return [];
    }
  },
  async add(input) {
    const memory = makeMemory(input);
    const all = await this.list();
    all.push(memory);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    return memory;
  },
};

// Convert stored Supabase image into browser accessible URL
function getPublicImageUrl(imagePath: string | null): string | null {
  
	if (!imagePath || !supabase) {
    		return null;
  	}

  	const { data } = supabase.storage
    	.from("memory-images")
    	.getPublicUrl(imagePath);

  	return data.publicUrl;
}

/** Milestone 2: shared garden backed by the `memories` table. */
// milestone 3: implement the support for viewing the images of memories

const supabaseRepo: MemoryRepo = {
  async list() {
    const { data, error } = await supabase!
      .from("memories")
      .select("id, title, body, author, x, y, image_path, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      author: row.author,
      x: row.x,
      y: row.y,
      image: getPublicImageUrl(row.image_path),
      createdAt: row.created_at,
    }));
  },

  async add(input) {
    let imagePath: string | null = null;

    if (input.image instanceof File) {
      const extension = input.image.name.split(".").pop() || "jpg";
      imagePath = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase!.storage
        .from("memory-images")
        .upload(imagePath, input.image, {
          cacheControl: "3600",
          contentType: input.image.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }
    }

    const { data, error } = await supabase!
      .from("memories")
      .insert({
        title: input.title,
        body: input.body,
        author: input.author,
        x: input.x,
        y: input.y,
        image_path: imagePath,
      })
      .select("id, title, body, author, x, y, image_path, created_at")
      .single();

    if (error) {
      if (imagePath) {
        await supabase!.storage
          .from("memory-images")
          .remove([imagePath]);
      }

      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      body: data.body,
      author: data.author,
      x: data.x,
      y: data.y,
      image: getPublicImageUrl(data.image_path),
      createdAt: data.created_at,
    };
  },
};

export const repo: MemoryRepo = supabase ? supabaseRepo : localRepo;

/** True when the app is running against the shared cloud garden. */
export const isShared = supabase !== null;
