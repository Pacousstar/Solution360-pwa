import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function handleLogout() {
  'use server'
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
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
  
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminDemandesPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
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
  
  if (!user) {
    redirect('/login')
  }

  const adminEmails = ['pacous2000@gmail.com', 'admin@solution360.app']
  const isAdmin = adminEmails.includes(user.email || '')
  
  if (!isAdmin) {
    redirect('/demandes')
  }

  const { data: demandes } = await supabase
    .from('requests')
    .select('*, ai_analyses (*)')
    .order('created_at', { ascending: false })

  const requestsList = demandes || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📊 Admin Dashboard
              </h1>
              <p className="text-orange-100">
                {requestsList.length} demande(s) • {user.email}
              </p>
            </div>
            <form action={handleLogout}>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-orange-100 to-green-100">
                <tr className="border-b-2 border-orange-300">
                  <th className="p-4 text-left font-bold text-gray-800">ID</th>
                  <th className="p-4 text-left font-bold text-gray-800 hidden lg:table-cell">Client</th>
                  <th className="p-4 text-left font-bold text-gray-800">Projet</th>
                  <th className="p-4 text-center font-bold text-gray-800">Statut</th>
                  <th className="p-4 text-right font-bold text-gray-800">Prix IA</th>
                  <th className="p-4 text-right font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requestsList.length > 0 ? (
                  requestsList.map((d: any) => (
                    <tr 
                      key={d.id}
                      className="border-b border-gray-100 hover:bg-orange-50 transition-all duration-200"
                    >
                      <td className="p-4">
                        <span className="font-mono text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-semibold">
                          #{d.id?.slice(-6) || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 font-medium hidden lg:table-cell">
                        {d.full_name || d.email || 'Client'}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {d.project_type || 'Projet'}
                        </div>
                        <div className="text-gray-500 text-xs max-w-xs truncate mt-1">
                          {d.project_description?.substring(0, 60) || 'Aucune description'}...
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          d.status === 'pending' 
                            ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' 
                            : d.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
                            : d.status === 'completed' 
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-300' 
                            : 'bg-gray-100 text-gray-700 ring-1 ring-gray-300'
                        }`}>
                          {d.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-green-600 text-right text-base">
                        {d.ai_analyses?.[0]?.estimated_price 
                          ? `${d.ai_analyses[0].estimated_price.toLocaleString()} FCFA`
                          : <span className="text-gray-400 text-sm font-normal">À analyser</span>
                        }
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/detail/${d.id}`}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Détail
                          </Link>
                          <Link
                            href={`/admin/gerer/${d.id}`}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Gérer
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center text-5xl shadow-lg">
                          📭
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Aucune demande
                          </h3>
                          <p className="text-gray-500">
                            Les demandes clients apparaîtront ici
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
