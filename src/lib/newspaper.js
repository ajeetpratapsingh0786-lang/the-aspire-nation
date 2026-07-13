import { supabase } from "@/lib/supabaseClient";

export async function getNewspapers() {
  const { data, error } = await supabase
    .from("newspapers")
    .select("*")
    .order("edition_date", { ascending: false });

  return { data, error };
}

export async function createNewspaper(payload) {
  const { data, error } = await supabase
    .from("newspapers")
    .insert([payload])
    .select();

  return { data, error };
}

export async function updateNewspaper(id, payload) {
  const { data, error } = await supabase
    .from("newspapers")
    .update(payload)
    .eq("id", id)
    .select();

  return { data, error };
}

export async function deleteNewspaper(id) {
  const { error } = await supabase
    .from("newspapers")
    .delete()
    .eq("id", id);

  return { error };
}