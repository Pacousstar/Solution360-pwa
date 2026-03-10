'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const fullName = (formData.get('fullName') as string)?.trim()

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Utilisateur introuvable' }
  }

  // Vérifier si admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  if (adminUser) {
    redirect('/admin/demandes')
  } else {
    redirect('/demandes')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const fullName = (formData.get('fullName') as string)?.trim()

  if (!fullName) {
    return { error: 'Le nom complet est requis' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profil')
  revalidatePath('/', 'layout')
  return { success: true }
}
