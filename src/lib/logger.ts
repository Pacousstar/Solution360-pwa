// /src/lib/logger.ts
// ✅ SYSTÈME DE LOGGING CONDITIONNEL - MonAP
// Logs uniquement en développement, jamais en production

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Les erreurs sont toujours loggées (même en production)
    // Mais on peut les envoyer à un service de monitoring en production
    console.error(...args);
    
    // TODO: En production, envoyer à Sentry ou autre service de monitoring
    // if (!isDevelopment) {
    //   Sentry.captureException(new Error(args.join(' ')));
    // }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};
