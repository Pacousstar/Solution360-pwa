// /src/components/ui/Badge.tsx
// ✅ Composant Badge réutilisable - Solution360°
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  status?: 'draft' | 'analysis' | 'awaiting_payment' | 'in_production' | 'delivered' | 'cancelled' | 'pending';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size = 'md', status, children, ...props }, ref) => {
    // Si status est fourni, utiliser les couleurs de statut
    if (status) {
      const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        analysis: 'bg-blue-100 text-blue-700 border-blue-200',
        awaiting_payment: 'bg-orange-100 text-orange-700 border-orange-200',
        in_production: 'bg-purple-100 text-purple-700 border-purple-200',
        delivered: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      };

      const statusLabels: Record<string, string> = {
        draft: 'Brouillon',
        analysis: 'En analyse',
        awaiting_payment: 'En attente paiement',
        in_production: 'En production',
        delivered: 'Livré',
        cancelled: 'Annulé',
        pending: 'En attente',
      };

      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center font-bold rounded-full border px-3 py-1',
            statusColors[status] || statusColors.draft,
            size === 'sm' && 'text-xs px-2 py-0.5',
            size === 'lg' && 'text-base px-4 py-1.5',
            className
          )}
          {...props}
        >
          {children || statusLabels[status]}
        </span>
      );
    }

    // Sinon, utiliser les variants standards
    const variants = {
      default: 'bg-orange-100 text-orange-700 border-orange-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      danger: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-3 py-1',
      lg: 'text-base px-4 py-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-bold rounded-full border',
          variant ? variants[variant] : variants.default,
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
