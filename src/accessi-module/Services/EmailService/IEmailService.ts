export interface IEmailService {
    /**
     * Invia un'email di verifica all'utente e aggiorna la chiave di registrazione nel database.
     * 
     * @param {string} email - Email del destinatario.
     * @param {string} codiceUtente - Codice utente per il database.
     * @param {string} baseUrl - URL base per il link di verifica.
     * @returns {Promise<void>} Una Promise che si risolve al completamento dell'invio.
     * @throws {Error} Se l'invio dell'email fallisce.
     */
    sendVerificationEmail(email: string, codiceUtente: string, baseUrl: string): Promise<void>;
  
    /**
     * Invia un'email di recupero password con un link per reimpostarla.
     * 
     * @param {string} email - Email del destinatario.
     * @param {string} resetToken - Token univoco per il reset della password.
     * @param {string} baseUrl - URL base per il link di reset della password.
     * @returns {Promise<void>} Una Promise che si risolve al completamento dell'invio.
     * @throws {Error} Se l'invio dell'email fallisce.
     */
    sendPasswordResetEmail(email: string, baseUrl: string): Promise<void>;
  
    /**
     * Invia un'email di conferma per la modifica dell'account o di altri dettagli.
     * 
     * @param {string} email - Email del destinatario.
     * @param {string} message - Messaggio personalizzato per la conferma.
     * @returns {Promise<void>} Una Promise che si risolve al completamento dell'invio.
     * @throws {Error} Se l'invio dell'email fallisce.
     */
    sendAccountUpdateEmail(email: string, message: string): Promise<void>;
  }
  