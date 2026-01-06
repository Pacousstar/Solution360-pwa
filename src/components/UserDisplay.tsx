// components/UserDisplay.tsx ✅ SANS CONTEXTE COMPLEXE
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '../lib/supabase-client';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

export default function UserDisplay() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseClient();
    
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: adminCheck } = await supabase
          .from("admin_users")
          .select("is_admin")
          .eq("user_id", authUser.id)
          .single();
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          is_admin: !!adminCheck?.is_admin
        });
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) getUser();
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="px-4 py-2">Chargement...</div>;
  }

  if (!user) {
    return (
      <Link href="/login" className="px-6 py-2 bg-orange-500 text-white font-bold rounded-2xl hover:shadow-lg">
        Connexion
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-emerald-50 rounded-2xl shadow-lg">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-emerald-500 rounded-2xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">{user.email.slice(0,1).toUpperCase()}</span>
      </div>
      <div>
        <p className="font-bold text-sm">
          {user.is_admin ? '🛡️ Admin' : '👤 Client'}
        </p>
        <p className="text-xs text-gray-600">{user.email.slice(0,20)}...</p>
      </div>
      {user.is_admin && (
        <Link href="/admin/demandes" className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-xl">
          Admin
        </Link>
      )}
      <form action={async () => {
        'use server';
        const supabase = await import('@/lib/supabase-server').then(m => m.createSupabaseServerClient());
        await supabase.auth.signOut();
      }}>
        <button type="submit" className="text-gray-500 hover:text-red-500">✕</button>
      </form>
    </div>
  );
}
