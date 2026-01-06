// /src/lib/admin/permissions.ts
import { createAdminClient } from '@/lib/supabase/admin';

export async function getUserRole(userId: string) {
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
        console.log(`No role found for user ${userId}, defaulting to 'user'`);
        return { role: 'user', permissions: {} };
      }
      console.error('Error fetching user role:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getUserRole:', err);
    return null;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const roleData = await getUserRole(userId);
  return roleData?.role === 'admin' || roleData?.role === 'super_admin';
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const roleData = await getUserRole(userId);
  return roleData?.role === 'super_admin';
}

export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const roleData = await getUserRole(userId);
  
  if (!roleData) return false;
  
  const permissions = roleData.permissions || {};
  return permissions[permission] === true;
}
