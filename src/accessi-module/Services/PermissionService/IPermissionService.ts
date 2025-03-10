import { IAbilitazioneMenu } from "../UserService/IUserService";

export enum TipoAbilitazione {
  NESSUNA = 0,
  LETTURA = 10,
  SCRITTURA = 20
  // SPECIAL = 30 IGNORA PER ORA
}

export interface IAbilitazione {
  codiceUtente: string;
  codiceMenu: string;
  tipoAbilitazione: TipoAbilitazione;
}

export interface IMenu {
  codiceMenu: string;
  descrizioneMenu: string;
  tipoAbilitazione: TipoAbilitazione;
}

export interface IRoleWithMenus {
  codiceRuolo: number;
  descrizioneRuolo: string;
  menu: IMenu[];
}

/**
 * Interfaccia per la gestione delle abilitazioni utente.
 */
export interface IPermissionService {
  /**
   * Aggiunge le abilitazioni per un utente, prima eliminando quelle esistenti e poi inserendo quelle nuove.
   * 
   * @param {string} codiceUtente - Il codice utente per cui aggiungere le abilitazioni.
   * @param {any[]} menuAbilitazioni - Un array di oggetti che rappresentano le abilitazioni da aggiungere.
   * @returns {Promise<void>} - Una promessa che si risolve quando tutte le operazioni sono completate.
   * @throws {Error} - Lancia un errore in caso di problemi con le operazioni di database.
   */
  addAbilitazioni(codiceUtente: string, menuAbilitazioni: any[]): Promise<void>;

  /**
   * Resetta le abilitazioni di un utente eliminando tutte le sue autorizzazioni esistenti.
   * 
   * @param {string} codiceUtente - Il codice utente per cui resettare le abilitazioni.
   * @returns {Promise<void>} - Conferma il completamento dell'operazione.
   * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
   */
  resetAbilitazioni(codiceUtente: string): Promise<void>;

  /**
   * Recupera la lista delle abilitazioni di un utente specifico.
   * 
   * @param {string} codiceUtente - Il codice dell'utente di cui ottenere le abilitazioni.
   * @returns {Promise<IAbilitazione[]>} - Una promessa che restituisce un array di oggetti contenenti le abilitazioni.
   * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
   */
  getAbilitazioniMenu(codiceUtente: string, isSuperAdmin: boolean): Promise<IAbilitazioneMenu[]>

  /**
   * Recupera tutti i ruoli disponibili con i menu associati a ciascun ruolo.
   * 
   * @returns {Promise<IRoleWithMenus[]>} 
   * - Una promessa che restituisce un array di oggetti contenenti i ruoli e i menu associati.
   * @throws {Error} - Lancia un errore in caso di problemi con la query o la connessione al database.
   */
  getRolesWithMenus(): Promise<IRoleWithMenus[]>;
}
