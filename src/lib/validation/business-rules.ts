// /src/lib/validation/business-rules.ts
// ✅ VALIDATION RÈGLES MÉTIER - MonAP
// Ce fichier centralise toutes les règles métier pour garantir leur respect strict

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * RÈGLE 1 : Impossible de passer à `awaiting_payment` sans prix final
 */
export function validateAwaitingPayment(demande: any): ValidationResult {
  if (!demande.final_price || demande.final_price <= 0) {
    return {
      valid: false,
      error: '❌ Impossible : Vous devez d\'abord envoyer un devis avec un prix final (onglet Tarification)',
    };
  }

  if (!demande.price_justification || demande.price_justification.trim().length === 0) {
    return {
      valid: false,
      error: '❌ Impossible : La justification du tarif est obligatoire (onglet Tarification)',
    };
  }

  return { valid: true };
}

/**
 * RÈGLE 2 : Impossible de passer à `in_production` sans paiement confirmé
 */
export function validateInProduction(demande: any, paymentConfirmed: boolean = false): ValidationResult {
  // Vérifier qu'il y a un prix final
  if (!demande.final_price || demande.final_price <= 0) {
    return {
      valid: false,
      error: '❌ Impossible : Un devis avec prix final doit être envoyé avant la production',
    };
  }

  // Vérifier que le paiement est confirmé
  // Note: Pour l'instant, on vérifie seulement que le statut précédent est awaiting_payment
  // Quand le système de paiement sera implémenté, vérifier paymentConfirmed === true
  if (demande.status !== 'awaiting_payment' && !paymentConfirmed) {
    return {
      valid: false,
      error: '❌ Impossible : Le paiement doit être confirmé avant de passer en production. Changez d\'abord le statut à "En attente de paiement" et attendez la confirmation du paiement.',
    };
  }

  return { valid: true };
}

/**
 * RÈGLE 3 : Impossible de passer à `delivered` sans livrables uploadés
 */
export function validateDelivered(demande: any, deliverablesCount: number = 0): ValidationResult {
  if (deliverablesCount === 0) {
    return {
      valid: false,
      error: '❌ Impossible : Vous devez uploader au moins un livrable avant de marquer comme "Livré" (onglet Livrables)',
    };
  }

  if (demande.status !== 'in_production') {
    return {
      valid: false,
      error: '❌ Impossible : Le projet doit être "En production" avant d\'être marqué comme "Livré"',
    };
  }

  return { valid: true };
}

/**
 * RÈGLE 4 : Impossible de passer directement de `pending` à `delivered`
 */
export function validateStatusTransition(oldStatus: string, newStatus: string): ValidationResult {
  const validTransitions: Record<string, string[]> = {
    pending: ['analysis', 'cancelled'],
    draft: ['pending', 'analysis', 'cancelled'],
    analysis: ['awaiting_payment', 'cancelled'],
    awaiting_payment: ['in_production', 'cancelled'],
    in_production: ['delivered', 'cancelled'],
    delivered: [], // Statut final, pas de transition possible
    cancelled: [], // Statut final, pas de transition possible
  };

  const allowed = validTransitions[oldStatus] || [];

  if (newStatus === oldStatus) {
    return { valid: true }; // Rester au même statut est OK
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `❌ Transition invalide : Impossible de passer de "${oldStatus}" à "${newStatus}". Transitions autorisées : ${allowed.join(', ') || 'Aucune'}`,
    };
  }

  return { valid: true };
}

/**
 * Validation complète avant changement de statut
 */
export function validateStatusChange(
  oldStatus: string,
  newStatus: string,
  demande: any,
  deliverablesCount: number = 0,
  paymentConfirmed: boolean = false
): ValidationResult {
  // Vérifier la transition générale
  const transitionCheck = validateStatusTransition(oldStatus, newStatus);
  if (!transitionCheck.valid) {
    return transitionCheck;
  }

  // Vérifications spécifiques selon le nouveau statut
  if (newStatus === 'awaiting_payment') {
    return validateAwaitingPayment(demande);
  }

  if (newStatus === 'in_production') {
    return validateInProduction(demande, paymentConfirmed);
  }

  if (newStatus === 'delivered') {
    return validateDelivered(demande, deliverablesCount);
  }

  return { valid: true };
}

