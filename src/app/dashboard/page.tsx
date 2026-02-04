import { redirect } from 'next/navigation';

/**
 * Page /dashboard - Redirige vers /demandes
 * Cette page existe pour éviter les erreurs 404 si quelqu'un accède à /dashboard
 * Toutes les fonctionnalités sont maintenant dans /demandes
 */
export default async function DashboardPage() {
  // Rediriger directement vers /demandes
  redirect('/demandes');
}
