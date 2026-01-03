import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

async function updateStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  await supabase
    .from('requests')
    .update({ status })
    .eq('id', id)

  redirect(`/admin/detail/${id}`)
}

export default async function AdminGererPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // ✅ AWAIT params
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminEmails = ['pacous2000@gmail.com', 'admin@solution360.app']
  if (!adminEmails.includes(user.email || '')) redirect('/demandes')

  const { data: demande } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!demande) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/demandes"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 hover:gap-3 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux demandes
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gérer la demande
          </h1>
          <p className="text-gray-500 mb-8">
            ID: <span className="font-mono bg-orange-100 text-orange-700 px-2 py-1 rounded">
              #{demande.id.slice(-6)}
            </span>
          </p>

          <form action={updateStatus} className="space-y-6">
            <input type="hidden" name="id" value={demande.id} />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Modifier le statut
              </label>
              <select
                name="status"
                defaultValue={demande.status}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-800 font-medium"
              >
                <option value="pending">⏳ En attente</option>
                <option value="in_progress">🔄 En cours</option>
                <option value="completed">✅ Terminé</option>
              </select>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/admin/detail/${demande.id}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-center transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
