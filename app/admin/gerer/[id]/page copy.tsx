'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function GererDemande() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const status = searchParams.get('status') || '';

  const [demande, setDemande] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // Charger demande
  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur:', error);
          return;
        }
        setDemande(data);
        setNotes(data?.admin_notes || '');
        setLoading(false);
        
        // Auto-update si status dans URL
        if (status && data && data.status !== status) {
          updateStatus(status);
        }
      });
  }, [id]);

  // Update statut
  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage('');
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error && demande) {
      setDemande({ ...demande, status: newStatus });
      setMessage(`✅ Statut → ${newStatus}`);
    } else {
      setMessage(`❌ Erreur: ${error?.message}`);
    }
    setUpdating(false);
  };

  // Sauvegarder notes
  const saveNotes = async () => {
    setUpdating(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from('requests')
      .update({ admin_notes: notes })
      .eq('id', id);
    
    if (!error) {
      setMessage('✅ Notes sauvegardées');
    } else {
      setMessage(`❌ Erreur: ${error.message}`);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-700">Chargement demande #{id.slice(-8)}...</p>
        </div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-red-600 mb-6">❌ Demande introuvable</h1>
          <p className="text-xl text-gray-600 mb-8">ID: <code className="bg-red-100 px-4 py-2 rounded-xl font-mono">{id}</code></p>
          <Link href="/admin/demandes" className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl inline-block">
            ← Retour tableau
          </Link>
        </div>
      </div>
    );
  }

  const formatStatus = (s: string | null) => ({
    draft: "🖊️ Brouillon",
    analysis: "🤖 IA Analysis",
    awaiting_payment: "💳 Attente Paiement",
    in_production: "⚙️ Production",
    delivered: "✅ Livré",
    cancelled: "❌ Annulé"
  }[s || ""] || s || "❓");

  const formatCurrency = (n: number | null) => 
    n ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(n) : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <Link 
              href={`/admin/demandes/${id}`} 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-md"
            >
              ← Détail complet
            </Link>
            <Link 
              href="/admin/demandes" 
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Tableau Admin
            </Link>
            <div className="flex-1 min-w-0 text-right">
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
                Gérer #{demande.id.slice(-8)}
              </h1>
              <div className="flex items-center gap-4 mt-2 justify-end">
                <span className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-lg shadow-lg">
                  {formatStatus(demande.status)}
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(demande.budget_proposed)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-auto max-w-2xl p-6 rounded-3xl shadow-xl mb-8 text-center font-bold text-xl ${
            message.includes('✅') 
              ? 'bg-emerald-100 border-4 border-emerald-400 text-emerald-800' 
              : 'bg-red-100 border-4 border-red-400 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Statut */}
          <div>
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-gray-900 mb-10 text-center">🎯 Changer statut</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { status: 'analysis', label: '🤖 Lancer IA Analysis', color: 'from-blue-500 to-indigo-600' },
                  { status: 'awaiting_payment', label: '💳 Demander paiement client', color: 'from-orange-500 to-red-500' },
                  { status: 'in_production', label: '⚙️ Passer en production', color: 'from-purple-500 to-pink-500' },
                  { status: 'delivered', label: '✅ Marquer comme livré', color: 'from-emerald-500 to-teal-600' }
                ].map(({ status: s, label, color }) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating || demande.status === s}
                    className={`
                      p-8 rounded-3xl font-black text-xl shadow-2xl transition-all hover:shadow-3xl hover:scale-[1.02]
                      ${demande.status === s 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default shadow-lg' 
                        : `bg-gradient-to-r ${color} text-white`}
                      ${updating ? 'opacity-50 cursor-not-allowed scale-95' : ''}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-orange-900 mb-8">📝 Notes Admin</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-64 p-8 border-2 border-orange-200 rounded-3xl resize-vertical text-xl font-mono leading-relaxed focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all shadow-inner"
                placeholder="• Date appel client...
• Questions posées...
• Actions à faire...
• Prix final proposé...
• Suivi paiement..."
              />
              <button
                onClick={saveNotes}
                disabled={updating || !notes.trim()}
                className="mt-8 w-full px-12 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
              >
                💾 SAUVEGARDER NOTES
              </button>
            </div>
          </div>
        </div>

        {/* Upload livrable */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-black text-emerald-900 mb-10 text-center">📎 Upload livrable final</h3>
            <div className="max-w-2xl mx-auto">
              <div className="border-4 border-dashed border-emerald-300 rounded-3xl p-12 text-center hover:border-emerald-400 transition-all hover:bg-emerald-50 cursor-pointer group">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 2-2m-8 4h16a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-emerald-700 mb-2 group-hover:text-emerald-800">
                  Glisser fichier OU cliquer
                </p>
                <p className="text-lg text-emerald-600 mb-8">PDF, ZIP, Figma, Drive...</p>
                <input 
                  type="file" 
                  className="hidden"
                  accept=".pdf,.zip,.docx,.pptx,image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    console.log('Fichiers:', files);
                    // TODO: Upload logique
                  }}
                />
              </div>
              <button className="mt-8 w-full p-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02]">
                🚀 PUBLIER LIVRABLE FINAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
