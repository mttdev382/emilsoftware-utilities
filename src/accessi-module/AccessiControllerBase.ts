import { Request, Response } from "express";


/**
 * Controller per la gestione degli accessi e delle operazioni correlate.
 * Fornisce metodi per login, registrazione, crittografia, decrittografia e gestione delle autorizzazioni utente.
 */
export abstract class AccessiControllerBase {

    constructor() { }


    //#region getUserByToken SwaggerDoc
    /**
     * @swagger
     * /get-user-by-token:
     *   post:
     *     summary: Recupera le informazioni utente dal token JWT
     *     description: Estrae e restituisce le informazioni utente decodificate da un token JWT valido.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *             required:
     *               - token
     *     responses:
     *       200:
     *         description: Informazioni utente recuperate con successo
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userData:
     *                   type: object
     *       400:
     *         description: Token non valido o assente
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract getUserByToken(req: Request<{}, {}, { token: string }>, res: Response)

    //#region login SwaggerDoc
    /**
     * @swagger
     * /login:
     *   post:
     *     summary: Effettua il login di un utente
     *     description: Autentica un utente e restituisce un token JWT.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *             required:
     *               - username
     *               - password
     *     responses:
     *       200:
     *         description: Login effettuato con successo
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: 'jwt_token_here'
     *       400:
     *         description: Credenziali errate
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract login(req: Request, res: Response)

    //#region getUsers SwaggerDoc
    /**
      * @swagger
      * /users:
      *   get:
      *     summary: Recupera la lista degli utenti
      *     description: Restituisce una lista di utenti dal sistema.
      *     responses:
      *       200:
      *         description: Lista degli utenti recuperata con successo
      *         content:
      *           application/json:
      *             schema:
      *               type: array
      *               items:
      *                 type: object
      *                 properties:
      *                   id:
      *                     type: string
      *                     description: ID univoco dell'utente
      *                   name:
      *                     type: string
      *                     description: Nome dell'utente
      *                   email:
      *                     type: string
      *                     description: Email dell'utente
      *       400:
      *         description: Richiesta non valida
      *       500:
      *         description: Errore del server
      */
    //#endregion
    public abstract getUsers(req: Request, res: Response)

    //#region deleteUser SwaggerDoc
    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Elimina un utente
     *     description: Elimina un utente dal sistema utilizzando il suo ID univoco.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID univoco dell'utente da eliminare
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Utente eliminato con successo
     *       400:
     *         description: Richiesta non valida
     *       404:
     *         description: Utente non trovato
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract deleteUser(req: Request, res: Response)

    //#region register SwaggerDoc
    /**
     * @swagger
     * /register:
     *   post:
     *     summary: Registra un nuovo utente
     *     description: Registra un nuovo utente nel sistema.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *               email:
     *                 type: string
     *             required:
     *               - username
     *               - password
     *               - email
     *     responses:
     *       200:
     *         description: Utente registrato con successo
     *       400:
     *         description: Dati di registrazione non validi
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract register(req: Request, res: Response)

    //#region encrypt SwaggerDoc
    /**
     * @swagger
     * /encrypt:
     *   post:
     *     summary: Crittografa i dati forniti
     *     description: Crittografa i dati passati nel corpo della richiesta.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               data:
     *                 type: string
     *             required:
     *               - data
     *     responses:
     *       200:
     *         description: Dati crittografati con successo
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: 'encrypted_data_here'
     *       400:
     *         description: Dati non validi
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract encrypt(req: Request<{}, {}, { data: string }>, res: Response)

    //#region decrypt SwaggerDoc
    /**
     * @swagger
     * /decrypt:
     *   post:
     *     summary: Decrittografa i dati forniti
     *     description: Decrittografa i dati passati nel corpo della richiesta.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               data:
     *                 type: string
     *             required:
     *               - data
     *     responses:
     *       200:
     *         description: Dati decrittografati con successo
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: 'decrypted_data_here'
     *       400:
     *         description: Dati non validi
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract decrypt(req: Request<{}, {}, { data: string }>, res: Response)

    //#region resetAbilitazioni SwaggerDoc
    /**
     * @swagger
     * /reset-abilitazioni:
     *   post:
     *     summary: Resetta le abilitazioni di un utente
     *     description: Resetta le abilitazioni di un utente dato il codice utente.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codiceUtente:
     *                 type: string
     *             required:
     *               - codiceUtente
     *     responses:
     *       200:
     *         description: Abilitazioni resettate con successo
     *       400:
     *         description: Codice utente non valido
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract resetAbilitazioni(req: Request<{}, {}, { codiceUtente: string }>, res: Response)

    //#region setPassword SwaggerDoc
    /**
     * @swagger
     * /set-password:
     *   post:
     *     summary: Imposta una nuova password per un utente
     *     description: Imposta una nuova password per un utente dato il codice utente e la nuova password.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codiceUtente:
     *                 type: string
     *               nuovaPassword:
     *                 type: string
     *             required:
     *               - codiceUtente
     *               - nuovaPassword
     *     responses:
     *       200:
     *         description: Password impostata con successo
     *       400:
     *         description: Dati non validi
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract setPassword(req: Request<{}, {}, { codiceUtente: string, nuovaPassword: string }>, res: Response)

    //#region updateUtente SwaggerDoc
    /**
     * @swagger
     * /update-utente:
     *   post:
     *     summary: Aggiorna un utente esistente.
     *     description: Questo endpoint permette di aggiornare i dati di un utente esistente.
     *     tags:
     *       - Utenti
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codiceUtente:
     *                 type: string
     *                 description: Il codice identificativo dell'utente.
     *                 example: "U12345"
     *               campo1:
     *                 type: string
     *                 description: Primo campo fittizio dell'utente da aggiornare.
     *                 example: "NuovoValore1"
     *               campo2:
     *                 type: string
     *                 description: Secondo campo fittizio dell'utente da aggiornare.
     *                 example: "NuovoValore2"
     *     responses:
     *       200:
     *         description: Utente aggiornato con successo.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Utente U12345 aggiornato con successo."
     *       400:
     *         description: Errore di validazione o richiesta non valida.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Impossibile aggiornare senza codice utente."
     *       500:
     *         description: Errore interno del server.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Errore interno del server."
     */
    //#endregion
    public abstract updateUtente(req: Request, res: Response)

    //#region setGdpr SwaggerDoc
    /**
     * @swagger
     * /set-gdpr:
     *   post:
     *     summary: Imposta il consenso GDPR per un utente
     *     description: Imposta il consenso GDPR per un utente dato il codice utente.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               codiceUtente:
     *                 type: string
     *             required:
     *               - codiceUtente
     *     responses:
     *       200:
     *         description: GDPR accettato con successo
     *       400:
     *         description: Codice utente non valido
     *       500:
     *         description: Errore del server
     */
    //#endregion
    public abstract setGdpr(req: Request<{}, {}, { codiceUtente: string }>, res: Response)

}
