import { supabase } from "./supabase";
import type { Profile } from "../types/profile";
import type { Memory } from "../types/memory";

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