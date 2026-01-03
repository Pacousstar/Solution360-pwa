import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Test() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("requests").select("*").limit(1);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
