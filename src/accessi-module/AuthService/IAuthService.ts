import { AccessiOptions } from "../AccessiModule";
import { StatoRegistrazione } from "../models/StatoRegistrazione";
import { TipoAbilitazione } from "../PermissionService/IPermissionService";
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
 * Restituisce la configurazione delle opzioni di accesso.
 * 
 * @returns {AccessiOptions} - Oggetto contenente le opzioni di configurazione per l'autenticazione.
 */
  getOptions(): AccessiOptions;

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
}
