// /src/lib/security.ts
// 🔐 FONCTIONS DE SÉCURITÉ - Solution360°
// Par MonAP - Chef de Projet

import { logger } from './logger';

/**
 * Sanitize une chaîne de caractères pour éviter les injections XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, '') // Supprimer les event handlers
    .trim();
}

/**
 * Valide un UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un montant en FCFA (positif, entier)
 */
export function isValidPrice(price: number): boolean {
  return (
    typeof price === 'number' &&
    !isNaN(price) &&
    price >= 0 &&
    price <= 100000000 && // Max 100 millions FCFA
    Number.isInteger(price)
  );
}

/**
 * Valide un statut de demande
 */
export function isValidStatus(status: string): boolean {
  const validStatuses = [
    'pending',
    'in_progress',
    'completed',
    'analysis',
    'awaiting_payment',
    'in_production',
    'delivered',
    'cancelled',
  ];
  return validStatuses.includes(status);
}

/**
 * Valide la longueur d'un texte
 */
export function validateTextLength(
  text: string,
  min: number = 0,
  max: number = 10000
): boolean {
  if (typeof text !== 'string') return false;
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Valide un nom de fichier (sécurité)
 */
export function isValidFilename(filename: string): boolean {
  if (typeof filename !== 'string') return false;
  
  // Vérifier la longueur
  if (filename.length > 255) return false;
  
  // Vérifier les caractères interdits
  const forbiddenChars = /[<>:"|?*\x00-\x1f]/;
  if (forbiddenChars.test(filename)) return false;
  
  // Vérifier les extensions autorisées
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.zip', '.rar', '.7z',
    '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.mp4', '.avi', '.mov',
    '.fig', '.sketch', '.xd',
    '.txt', '.md'
  ];
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * Valide la taille d'un fichier (en bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size >= 0 && size <= maxSizeBytes;
}

/**
 * Échappe les caractères spéciaux pour les requêtes SQL (prévention injection)
 * Note: Supabase utilise des requêtes paramétrées, mais cette fonction est utile pour la validation
 */
export function escapeSQL(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/'/g, "''").replace(/;/g, '');
}

/**
 * Valide les paramètres d'une requête API
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequestParams(params: Record<string, any>): ValidationResult {
  const errors: string[] = [];
  
  // Valider chaque paramètre selon son type
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue; // Les valeurs null/undefined sont acceptées
    }
    
    // Validation selon le type
    if (typeof value === 'string') {
      if (key.includes('id') && !isValidUUID(value)) {
        errors.push(`${key} doit être un UUID valide`);
      }
      if (key.includes('email') && !isValidEmail(value)) {
        errors.push(`${key} doit être un email valide`);
      }
      if (key === 'status' && !isValidStatus(value)) {
        errors.push(`${key} doit être un statut valide`);
      }
      if (value.length > 10000) {
        errors.push(`${key} est trop long (max 10000 caractères)`);
      }
    } else if (typeof value === 'number') {
      if (key.includes('price') && !isValidPrice(value)) {
        errors.push(`${key} doit être un prix valide (0-100000000 FCFA)`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting simple (en mémoire)
 * ⚠️ Pour la production, utiliser Redis ou un service dédié
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute par défaut
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // Nettoyer les anciennes entrées
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }
  
  const current = rateLimitStore.get(identifier);
  
  if (!current) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (current.count >= maxRequests) {
    logger.warn(`Rate limit dépassé pour ${identifier}`);
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Nettoie les données utilisateur avant insertion en base
 */
export function sanitizeUserInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeUserInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }
  
  return input;
}
