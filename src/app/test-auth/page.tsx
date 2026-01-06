import { createClient } from "@/lib/supabase/server";

export default async function TestAuthPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentification</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="font-bold text-red-800">Erreur:</p>
          <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {user ? (
        <div className="bg-green-100 p-4 rounded">
          <p className="font-bold text-green-800">✅ Utilisateur connecté:</p>
          <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-orange-100 p-4 rounded">
          <p className="font-bold text-orange-800">❌ Aucun utilisateur connecté</p>
        </div>
      )}
    </div>
  );
}
