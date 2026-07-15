import { supabase } from "./supabase";
import type { Profile } from "../types/profile";
import type { Memory } from "../types/memory";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../types/memory";

export async function listProfiles(): Promise<Profile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, is_admin")
    .order("email", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    isAdmin: row.is_admin,
  }));
}

export async function listMemoriesForUser(userId: string): Promise<Memory[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("memories")
    .select("id, title, body, author, x, y, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    author: row.author,
    x: row.x,
    y: row.y,
    createdAt: row.created_at,
  }));
}

export async function deleteMemory(memoryId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("memories").delete().eq("id", memoryId);
  if (error) throw error;
}

export async function addMemoryForUser(
  userId: string,
  input: { title: string; body: string; author: string },
): Promise<Memory> {
  if (!supabase) throw new Error("Supabase not configured");
  // Admin-planted memories don't come from a map click, so drop them
  // near the world center with a little random scatter.
  const x = WORLD_WIDTH / 2 + (Math.random() - 0.5) * 400;
  const y = WORLD_HEIGHT / 2 + (Math.random() - 0.5) * 400;

  const { data, error } = await supabase
    .from("memories")
    .insert({
      title: input.title,
      body: input.body,
      author: input.author,
      x,
      y,
      user_id: userId,
    })
    .select("id, title, body, author, x, y, created_at")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    body: data.body,
    author: data.author,
    x: data.x,
    y: data.y,
    createdAt: data.created_at,
  };
}
