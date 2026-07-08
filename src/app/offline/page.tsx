'use client';

import { Button } from '@/components/ui';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-sky-50">
      <div className="bg-white rounded-[2rem] p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-sm">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl text-gray-900 mb-2 font-semibold">
          Vous êtes hors ligne
        </h1>
        <p className="text-gray-500 leading-relaxed mb-6">
          Vérifiez votre connexion internet et réessayez.
        </p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}
