import { Resend } from 'resend';
import { logger } from './logger';

// Initialiser Resend avec la clé API (seulement si disponible)
// Si pas de clé, resend sera null et on utilisera le mode dev
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envoyer un email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Solution360° <onboarding@resend.dev>', // Domaine de test Resend (à changer quand domaine custom configuré)
}: EmailOptions) {
  try {
    // Si pas de clé API ou resend non initialisé, logger sans envoyer (mode développement)
    if (!resend || !process.env.RESEND_API_KEY) {
      logger.log('📧 [DEV MODE] Email à envoyer:', { to, subject });
      logger.log('📧 [DEV MODE] Contenu HTML:', html.substring(0, 200) + '...');
      return { success: true, id: 'dev-mode', error: null };
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      logger.error('❌ Erreur Resend:', error);
      return { success: false, id: null, error };
    }

    logger.log('✅ Email envoyé avec succès:', data?.id);
    return { success: true, id: data?.id || null, error: null };
  } catch (error: any) {
    logger.error('❌ Erreur sendEmail:', error);
    return { success: false, id: null, error: error.message || 'Erreur inconnue' };
  }
}

/**
 * Template HTML de base pour les emails Solution360°
 */
export function getEmailTemplate({
  title,
  content,
  ctaText,
  ctaUrl,
  footer,
}: {
  title: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #10b981 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                Solution360°
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                ${title}
              </h2>
              
              <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
              
              ${ctaUrl && ctaText ? `
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #f97316 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                ${footer || '© 2026 Solution360° - Tous droits réservés'}
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="https://solution360.app/termes" style="color: #9ca3af; text-decoration: none;">Termes et conditions</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template : Email de devis envoyé au client
 */
export function getQuoteEmailTemplate({
  clientName,
  requestTitle,
  finalPrice,
  priceJustification,
  requestId,
  baseUrl,
}: {
  clientName: string;
  requestTitle: string;
  finalPrice: number;
  priceJustification: string;
  requestId: string;
  baseUrl?: string;
}): string {
  let appUrl = baseUrl || process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
  // Ajouter https:// si manquant
  if (appUrl && !appUrl.startsWith('http')) {
    appUrl = `https://${appUrl}`;
  }
  const demandesUrl = `${appUrl}/demandes/${requestId}`;
  
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(finalPrice);

  const content = `
    <p style="margin: 0 0 20px 0;">
      Bonjour <strong>${clientName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0;">
      Nous avons le plaisir de vous faire parvenir notre devis pour votre projet <strong>"${requestTitle}"</strong>.
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 18px; font-weight: 600;">
        💰 Prix proposé : ${formattedPrice}
      </h3>
      <p style="margin: 0; color: #047857; font-size: 14px;">
        Prix final en FCFA
      </p>
    </div>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">
        📋 Justification du tarif
      </h3>
      <div style="color: #78350f; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
        ${priceJustification.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <p style="margin: 20px 0 0 0;">
      Pour accepter ce devis et procéder au paiement, cliquez sur le bouton ci-dessous.
    </p>
  `;

  return getEmailTemplate({
    title: 'Devis pour votre projet',
    content,
    ctaText: 'Voir le devis et payer',
    ctaUrl: demandesUrl,
    footer: 'Cordialement,<br>L\'équipe Solution360°',
  });
}

/**
 * Template : Email de réponse admin au client
 */
export function getResponseEmailTemplate({
  clientName,
  adminResponse,
  requestTitle,
  requestId,
  baseUrl,
}: {
  clientName: string;
  adminResponse: string;
  requestTitle: string;
  requestId: string;
  baseUrl?: string;
}): string {
  let appUrl = baseUrl || process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
  // Ajouter https:// si manquant
  if (appUrl && !appUrl.startsWith('http')) {
    appUrl = `https://${appUrl}`;
  }
  const demandesUrl = `${appUrl}/demandes/${requestId}`;

  const content = `
    <p style="margin: 0 0 20px 0;">
      Bonjour <strong>${clientName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0;">
      Nous avons une réponse concernant votre projet <strong>"${requestTitle}"</strong> :
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <div style="color: #1f2937; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
        ${adminResponse.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <p style="margin: 20px 0 0 0;">
      Vous pouvez consulter tous les détails de votre demande dans votre espace client.
    </p>
  `;

  return getEmailTemplate({
    title: 'Réponse à votre demande',
    content,
    ctaText: 'Voir ma demande',
    ctaUrl: demandesUrl,
    footer: 'Cordialement,<br>L\'équipe Solution360°',
  });
}

/**
 * Template : Email de confirmation de paiement
 */
export function getPaymentConfirmationEmailTemplate({
  clientName,
  requestTitle,
  amount,
  requestId,
  baseUrl,
}: {
  clientName: string;
  requestTitle: string;
  amount: number;
  requestId: string;
  baseUrl?: string;
}): string {
  let appUrl = baseUrl || process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
  // Ajouter https:// si manquant
  if (appUrl && !appUrl.startsWith('http')) {
    appUrl = `https://${appUrl}`;
  }
  const demandesUrl = `${appUrl}/demandes/${requestId}`;

  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount);

  const content = `
    <p style="margin: 0 0 20px 0;">
      Bonjour <strong>${clientName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0;">
      Votre paiement pour le projet <strong>"${requestTitle}"</strong> a été confirmé avec succès !
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 18px; font-weight: 600;">
        ✅ Paiement confirmé : ${formattedAmount}
      </h3>
      <p style="margin: 0; color: #047857; font-size: 14px;">
        Votre projet est maintenant en production. Notre équipe va commencer à travailler sur votre demande.
      </p>
    </div>
    
    <p style="margin: 20px 0 0 0;">
      Vous pouvez suivre l'avancement de votre projet dans votre espace client.
    </p>
  `;

  return getEmailTemplate({
    title: 'Paiement confirmé',
    content,
    ctaText: 'Suivre mon projet',
    ctaUrl: demandesUrl,
    footer: 'Merci de votre confiance !<br>L\'équipe Solution360°',
  });
}

/**
 * Template : Email de livraison effectuée
 */
export function getDeliveryEmailTemplate({
  clientName,
  requestTitle,
  requestId,
  baseUrl,
}: {
  clientName: string;
  requestTitle: string;
  requestId: string;
  baseUrl?: string;
}): string {
  let appUrl = baseUrl || process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
  // Ajouter https:// si manquant
  if (appUrl && !appUrl.startsWith('http')) {
    appUrl = `https://${appUrl}`;
  }
  const demandesUrl = `${appUrl}/demandes/${requestId}`;

  const content = `
    <p style="margin: 0 0 20px 0;">
      Bonjour <strong>${clientName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0;">
      Excellente nouvelle ! Votre projet <strong>"${requestTitle}"</strong> est terminé et livré ! 🎉
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 18px; font-weight: 600;">
        ✅ Projet livré avec succès
      </h3>
      <p style="margin: 0; color: #047857; font-size: 14px;">
        Tous les livrables sont maintenant disponibles dans votre espace client. Vous pouvez les télécharger à tout moment.
      </p>
    </div>
    
    <p style="margin: 20px 0 0 0;">
      Si vous avez des questions ou besoin d'ajustements, n'hésitez pas à nous contacter.
    </p>
  `;

  return getEmailTemplate({
    title: 'Votre projet est livré !',
    content,
    ctaText: 'Télécharger les livrables',
    ctaUrl: demandesUrl,
    footer: 'Merci de votre confiance !<br>L\'équipe Solution360°',
  });
}

/**
 * Template : Email de notification admin (nouvelle demande)
 */
export function getAdminNotificationEmailTemplate({
  adminName,
  requestTitle,
  clientEmail,
  requestId,
  baseUrl,
}: {
  adminName: string;
  requestTitle: string;
  clientEmail: string;
  requestId: string;
  baseUrl?: string;
}): string {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
  const adminUrl = `${appUrl}/admin/detail/${requestId}`;

  const content = `
    <p style="margin: 0 0 20px 0;">
      Bonjour <strong>${adminName}</strong>,
    </p>
    
    <p style="margin: 0 0 20px 0;">
      Une nouvelle demande a été soumise et nécessite votre attention.
    </p>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px; font-weight: 600;">
        📋 Nouvelle demande : "${requestTitle}"
      </h3>
      <p style="margin: 5px 0; color: #78350f; font-size: 14px;">
        <strong>Client :</strong> ${clientEmail}
      </p>
      <p style="margin: 5px 0; color: #78350f; font-size: 14px;">
        <strong>ID demande :</strong> ${requestId.slice(-8)}
      </p>
    </div>
    
    <p style="margin: 20px 0 0 0;">
      Veuillez analyser cette demande et préparer un devis pour le client.
    </p>
  `;

  return getEmailTemplate({
    title: 'Nouvelle demande reçue',
    content,
    ctaText: 'Voir la demande',
    ctaUrl: adminUrl,
    footer: 'Cordialement,<br>Système Solution360°',
  });
}

