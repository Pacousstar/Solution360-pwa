import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div className="p-8">❌ Non connecté</div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Debug Utilisateur</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Email :</h2>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">ID :</h2>
            <p className="text-gray-900 text-sm">{user.id}</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Nom complet :</h2>
            <p className="text-gray-900">{profile?.full_name || 'Non défini'}</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700">Rôle :</h2>
            <p className="text-gray-900">{profile?.role || 'Non défini'}</p>
          </div>

          <div className="pt-4 border-t">
            <h2 className="font-semibold text-gray-700 mb-2">Statut Admin :</h2>
            {profile?.is_admin ? (
              <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
                ✅ VOUS ÊTES ADMIN
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
                ❌ VOUS N'ÊTES PAS ADMIN
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h2 className="font-semibold text-gray-700 mb-2">Actions :</h2>
            <div className="space-y-2">
              {profile?.is_admin ? (
                <a
                  href="/admin/demandes"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Aller au dashboard admin
                </a>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Pour accéder aux pages admin, vous devez activer <code className="bg-yellow-100 px-1 py-0.5 rounded">is_admin = true</code> dans Supabase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
