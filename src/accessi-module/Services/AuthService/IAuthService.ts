import { AccessiOptions } from "../../AccessiModule";
import { IAbilitazioneMenu, IFiltriUtente, IUser } from "../UserService/IUserService";



export interface ILoginResult {
  utente: IUser;
  filtri: IFiltriUtente[];
  abilitazioni: IAbilitazioneMenu[];
  token?: {
    expiresIn: string,
    value: string,
    type: "Bearer" | "Basic"
  }
}

export interface LoginRequest {
  username: string,
  password: string
}


/**
 * Interfaccia per la gestione dell'autenticazione.
 */
export interface IAuthService {
  
  /**
   * Effettua il login dell'utente.
   * @param {LoginRequest} request - Richiesta contenente username e password.
   * @returns {Promise<LoginResponse>} - Oggetto contenente i dettagli dell'utente e le abilitazioni.
   * @throws {Error} - Se le credenziali non sono valide o l'utente non è autorizzato.
   */
  login(request: LoginRequest): Promise<ILoginResult>;

  /**
   * Restituisce un utente amministratore di test.
   * @returns {LoginResponse} - Dati dell'utente admin.
   */
  getAdminUser(): ILoginResult;

  /**
   * Restituisce un utente demo di test.
   * @returns {LoginResponse} - Dati dell'utente demo.
   */
  getDemoUser(): ILoginResult;

  /**
* Imposta o aggiorna la password per un utente.
* 
* @param {string} codiceUtente - Il codice utente a cui associare la nuova password.
* @param {string} nuovaPassword - La nuova password da impostare per l'utente.
* @returns {Promise<void>} - Conferma il completamento dell'operazione.
* @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
*/
  setPassword(codiceUtente: string, nuovaPassword: string): Promise<void>;

  /**
 * Verifica se la password fornita corrisponde a quella memorizzata per l'utente.
 * 
 * @param {string} codiceUtente - Il codice univoco dell'utente.
 * @param {string} passwordCifrata - La password cifrata da verificare.
 * @returns {Promise<boolean>} Una Promise che restituisce `true` se la password è corretta, altrimenti `false`.
 * @throws {Error} Se la query fallisce o si verifica un problema durante l'esecuzione.
 */
  verifyPassword(codiceUtente: string, passwordCifrata: string): Promise<boolean>;


  /**
 * Resetta la password di un utente utilizzando un token univoco.
 *  
 * @param {string} token - Il token di reset ricevuto via email.
 * @param {string} newPassword - La nuova password scelta dall'utente.
 * @returns {Promise<void>} - Nessun valore di ritorno se il reset ha successo.
 * @throws {Error} - Se il token è invalido o già usato, o se si verifica un errore nel database.
 */
  resetPassword(token: string, newPassword: string): Promise<void>;

}
