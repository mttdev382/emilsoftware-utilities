import { UserQueryResult } from "../../models/QueryResults/UserQueryResult";
import { StatoRegistrazione } from "../../models/StatoRegistrazione";
import { TipoAbilitazione } from "../PermissionService/IPermissionService";

export interface IAbilitazioneMenu {
  codiceMenu: string;
  tipoAbilitazione: TipoAbilitazione;
  descrizioneMenu: string;
  descrizioneGruppo: string;
  codiceGruppo: string;
  icona: string | null;
  tipo: string | null;
  pagina: string | null;
}

export interface IUser {
  codiceUtente: string;
  username: string;
  flagGdpr: boolean;
  statoRegistrazione: StatoRegistrazione;
  cognome: string;
  nome: string;
  avatar: string | null;
  flagDueFattori: boolean;
  codiceLingua: string;
  cellulare: string | null;
  flagSuper: boolean;
  paginaDefault: string;
}

export interface IFiltriUtente {
  progressivo: number;
  numeroReport: number;
  indicePersonale: number;
  codiceClienteSuper: string | null;
  codiceAgenzia: string | null;
  codiceClienteCollegato: string | null;
  codiceClienti: string | null;
  tipoFiltro: string | null;
}

export interface IUserService {
  /**
   * Registra un nuovo utente nel sistema.
   * @param {UserQueryResult} request - Dati dell'utente da registrare.
   * @returns {Promise<void>} Una Promise che si risolve al completamento dell'operazione.
   * @throws {Error} Se l'inserimento fallisce per qualsiasi motivo.
   */
  register(request: UserQueryResult): Promise<void>;

  /**
   * Recupera un utente in base al suo username.
   * 
   * @param {string} username - Lo username dell'utente da cercare.
   * @returns {Promise<IUser | null>} Una Promise che restituisce l'utente trovato o `null` se non esiste.
   * @throws {Error} Se la query fallisce o si verifica un problema durante l'esecuzione.
   */
  getUserByUsername(username: string): Promise<IUser | null>;

  /**
   * Recupera una lista di utenti con informazioni dettagliate.
   * @returns {Promise<UserQueryResult[]>} Una lista di utenti.
   * @throws {Error} Se la query fallisce.
   */
  getUsers(): Promise<UserQueryResult[]>;

  /**
   * Recupera il codice utente in base allo username.
   * @param {string} username - Username dell'utente.
   * @returns {Promise<{ codiceUtente: string }>} Oggetto con il codice utente.
   * @throws {Error} Se la query fallisce.
   */
  getCodiceUtenteByUsername(username: string): Promise<{ codiceUtente: string }>;

  /**
   * Aggiorna i dettagli di un utente esistente.
   * @param {UserQueryResult} user - Dati aggiornati dell'utente.
   * @returns {Promise<void>} Una Promise che si risolve al completamento dell'operazione.
   * @throws {Error} Se l'aggiornamento fallisce.
   */
  updateUser(user: UserQueryResult): Promise<void>;

  /**
   * Elimina un utente in base al codice cliente.
   * @param {string} codiceCliente - Il codice cliente dell'utente da eliminare.
   * @returns {Promise<void>} Una Promise che si risolve al completamento dell'operazione.
   * @throws {Error} Se l'eliminazione fallisce.
   */
  deleteUser(codiceCliente: string): Promise<void>;

  /**
* Imposta o inserisce i dati GDPR per un utente.
* 
* @param {string} codiceUtente - Il codice utente a cui associare i dati GDPR.
* @returns {Promise<any>} - Il risultato dell'esecuzione della query.
* @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
* @author mttdev382
 
*/
  setGdpr(codiceUtente: string): Promise<void>;

  /**
     * Imposta lo stato di registrazione di un utente.
     * 
     * @param {StatoRegistrazione} statoRegistrazione - Lo stato di registrazione da impostare per l'utente.
     * @param {string} codiceUtente - Il codice utente dell'utente a cui associare lo stato di registrazione.
     * @returns {Promise<void>} - Conferma il completamento dell'operazione.
     * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
     */
  setStatoRegistrazione(statoRegistrazione: StatoRegistrazione, codiceUtente: string): Promise<void>;


  /**
 * Recupera i filtri associati a un utente specifico.
 * 
 * @param {string} codiceUtente - Il codice univoco dell'utente.
 * @returns {Promise<IFiltriUtente[]>} Una Promise che restituisce un array di filtri dell'utente.
 * @throws {Error} Se la query fallisce o si verifica un problema durante l'esecuzione.
 */
  getUserFilters(codiceUtente: string): Promise<IFiltriUtente[]>;

}
