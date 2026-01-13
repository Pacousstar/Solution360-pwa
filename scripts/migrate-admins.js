#!/usr/bin/env node
/**
 * Script de migration automatique des admins
 * Solution360° - Par MonAP
 * 
 * Usage: node scripts/migrate-admins.js
 * 
 * Ce script migre automatiquement les admins vers la table user_roles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nVeuillez créer un fichier .env.local avec ces variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Liste des admins à migrer
const ADMINS_TO_MIGRATE = [
  {
    email: 'pacous2000@gmail.com',
    role: 'super_admin',
    permissions: {
      manage_requests: true,
      manage_users: true,
      manage_payments: true,
      manage_finance: true,
      manage_settings: true,
      view_analytics: true,
      manage_admins: true,
    },
  },
  {
    email: 'pacousstar02@gmail.com',
    role: 'admin',
    permissions: {
      manage_requests: true,
      manage_payments: true,
      view_analytics: true,
    },
  },
];

async function migrateAdmins() {
  console.log('🚀 Démarrage de la migration des admins...\n');

  for (const admin of ADMINS_TO_MIGRATE) {
    try {
      console.log(`📧 Recherche de l'utilisateur: ${admin.email}`);

      // 1. Trouver l'utilisateur par email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();

      if (userError) {
        console.error(`❌ Erreur lors de la recherche des utilisateurs:`, userError);
        continue;
      }

      const user = users.users.find((u) => u.email === admin.email);

      if (!user) {
        console.warn(`⚠️  Utilisateur non trouvé: ${admin.email}`);
        console.log(`   → Créez cet utilisateur via l'interface d'inscription ou le dashboard Supabase\n`);
        continue;
      }

      console.log(`   ✅ Utilisateur trouvé: ${user.id}`);

      // 2. Insérer dans user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          {
            user_id: user.id,
            role: admin.role,
            permissions: admin.permissions,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (roleError) {
        console.error(`❌ Erreur lors de l'insertion dans user_roles:`, roleError);
        continue;
      }

      console.log(`   ✅ Rôle ${admin.role} assigné avec succès`);

      // 3. Mettre à jour admin_users (legacy)
      const { error: adminUsersError } = await supabase
        .from('admin_users')
        .upsert(
          {
            user_id: user.id,
            is_admin: true,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (adminUsersError) {
        console.warn(`   ⚠️  Erreur lors de la mise à jour admin_users:`, adminUsersError.message);
      } else {
        console.log(`   ✅ admin_users mis à jour (legacy)`);
      }

      // 4. Mettre à jour profiles (synchronisation)
      const { error: profilesError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            role: admin.role === 'super_admin' ? 'admin' : 'admin',
            is_admin: true,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        );

      if (profilesError) {
        console.warn(`   ⚠️  Erreur lors de la mise à jour profiles:`, profilesError.message);
      } else {
        console.log(`   ✅ profiles mis à jour\n`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de ${admin.email}:`, error);
    }
  }

  // Vérification finale
  console.log('📊 Vérification finale...\n');

  const { data: allRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*, auth.users!inner(email)')
    .in('role', ['admin', 'super_admin']);

  if (rolesError) {
    console.error('❌ Erreur lors de la vérification:', rolesError);
  } else {
    console.log('✅ Admins migrés:');
    allRoles?.forEach((role) => {
      console.log(`   - ${role.user_id}: ${role.role}`);
    });
  }

  console.log('\n✅ Migration terminée !');
}

// Exécuter la migration
migrateAdmins()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
