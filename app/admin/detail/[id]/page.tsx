import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // ✅ AWAIT params (Next.js 15+)
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
    .select('*, ai_analyses (*)')
    .eq('id', id)
    .single()

  if (!demande) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Détails de la demande
              </h1>
              <p className="text-gray-500">
                ID: <span className="font-mono bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-semibold">
                  #{demande.id.slice(-6)}
                </span>
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              demande.status === 'pending' ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' :
              demande.status === 'in_progress' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' :
              demande.status === 'completed' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' :
              'bg-gray-100 text-gray-700 ring-1 ring-gray-300'
            }`}>
              {demande.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
              <h3 className="text-sm font-bold text-orange-700 uppercase mb-2">👤 Client</h3>
              <p className="text-lg font-semibold text-gray-900">
                {demande.full_name || demande.email || 'Client anonyme'}
              </p>
              {demande.email && (
                <p className="text-sm text-gray-600 mt-1">{demande.email}</p>
              )}
            </div>

            <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
              <h3 className="text-sm font-bold text-green-700 uppercase mb-2">📋 Type de projet</h3>
              <p className="text-lg font-semibold text-gray-900">{demande.project_type}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h3 className="text-sm font-bold text-blue-700 uppercase mb-2">📝 Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {demande.project_description || 'Aucune description fournie'}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <h3 className="text-sm font-bold text-green-700 uppercase mb-2">💰 Prix estimé (IA)</h3>
              <p className="text-3xl font-bold text-green-600">
                {demande.ai_analyses?.[0]?.estimated_price 
                  ? `${demande.ai_analyses[0].estimated_price.toLocaleString()} FCFA`
                  : 'Non analysé'
                }
              </p>
              {demande.ai_analyses?.[0]?.analysis_summary && (
                <p className="text-sm text-gray-600 mt-2">
                  {demande.ai_analyses[0].analysis_summary}
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">📅 Date de création</h3>
              <p className="text-gray-700">
                {new Date(demande.created_at).toLocaleString('fr-FR', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href={`/admin/gerer/${demande.id}`}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Gérer cette demande
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
