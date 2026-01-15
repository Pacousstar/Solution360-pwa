// /src/app/api/auth/check-admin/route.ts
// ✅ Route API pour vérifier le statut admin côté serveur
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/permissions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le statut admin côté serveur (sécurisé)
    const adminStatus = await isAdmin(user.id, user.email || undefined);

    return NextResponse.json({
      isAdmin: adminStatus,
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Erreur check-admin:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

