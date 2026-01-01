"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase-server";

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/demandes");
}

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/demandes");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
