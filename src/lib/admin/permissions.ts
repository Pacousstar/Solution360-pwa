// /src/lib/admin/permissions.ts
// ✅ LOGIQUE ADMIN CENTRALISÉE - MonAP
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// Liste des emails admin (fallback uniquement - à migrer vers table user_roles)
// ⚠️ À terme, tous les admins doivent être dans la table user_roles
const LEGACY_ADMIN_EMAILS = [
  'pacous2000@gmail.com',
  'pacousstar02@gmail.com',
] as const;

export interface UserRole {
  role: 'user' | 'admin' | 'super_admin';
  permissions?: Record<string, boolean>;
}

/**
 * Récupère le rôle d'un utilisateur depuis la table user_roles
 * @param userId ID de l'utilisateur
 * @returns Rôle de l'utilisateur ou null si erreur
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    // Utiliser le client admin pour bypass RLS
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Pas de rôle trouvé, retourner rôle par défaut
        return { role: 'user', permissions: {} };
      }
      logger.error('Error fetching user role:', error);
      return null;
    }

    return data as UserRole;
  } catch (err) {
    logger.error('Unexpected error in getUserRole:', err);
    return null;
  }
}

/**
 * Vérifie si un utilisateur est admin (via user_roles ou legacy emails)
 * @param userId ID de l'utilisateur
 * @param userEmail Email de l'utilisateur (pour fallback legacy)
 * @returns true si l'utilisateur est admin
 */
export async function isAdmin(
  userId: string,
  userEmail?: string
): Promise<boolean> {
  // 1. Vérifier via user_roles (méthode principale)
  const roleData = await getUserRole(userId);
  if (roleData?.role === 'admin' || roleData?.role === 'super_admin') {
    return true;
  }

  // 2. Fallback legacy : vérifier via admin_users (si table existe)
  try {
    const supabase = createAdminClient();
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminData?.is_admin === true) {
      return true;
    }
  } catch (err) {
    // Table admin_users peut ne pas exister, continuer
    logger.warn('admin_users table not accessible, trying legacy emails');
  }

  // 3. Fallback final : vérifier via emails hardcodés (legacy)
  // ⚠️ À supprimer une fois tous les admins migrés vers user_roles
  if (userEmail && LEGACY_ADMIN_EMAILS.includes(userEmail as any)) {
    logger.warn(`⚠️ Using legacy email check for ${userEmail}. Please migrate to user_roles table.`);
    return true;
  }

  return false;
}

/**
 * Vérifie si un utilisateur est super admin
 * @param userId ID de l'utilisateur
 * @returns true si l'utilisateur est super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const roleData = await getUserRole(userId);
  return roleData?.role === 'super_admin';
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param userId ID de l'utilisateur
 * @param permission Nom de la permission
 * @returns true si l'utilisateur a la permission
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const roleData = await getUserRole(userId);
  
  if (!roleData) return false;
  
  const permissions = roleData.permissions || {};
  return permissions[permission] === true;
}

/**
 * Récupère toutes les informations de rôle d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param userEmail Email de l'utilisateur (pour fallback)
 * @returns Objet avec isAdmin, isSuperAdmin, role, permissions
 */
export async function getUserRoleInfo(
  userId: string,
  userEmail?: string
): Promise<{
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: UserRole['role'];
  permissions: Record<string, boolean>;
}> {
  const roleData = await getUserRole(userId);
  const adminStatus = await isAdmin(userId, userEmail);
  const superAdminStatus = await isSuperAdmin(userId);

  return {
    isAdmin: adminStatus,
    isSuperAdmin: superAdminStatus,
    role: roleData?.role || 'user',
    permissions: roleData?.permissions || {},
  };
}
