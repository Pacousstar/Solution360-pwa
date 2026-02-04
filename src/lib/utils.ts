// /src/lib/utils.ts
// ✅ Utilitaires pour les composants UI - Solution360°
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
