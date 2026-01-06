// app/(auth)/actions.ts ✅ RELATIF CORRECT
'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase-server";  // ✅ 3 niveaux

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  
  if (error) throw error;
  
  revalidatePath('/login');
  redirect('/login');
}
