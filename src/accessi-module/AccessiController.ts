import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { autobind } from "../autobind";
import { Logger } from "../Logger";
import { CryptUtilities, RestUtilities } from "../Utilities";
import { AuthService } from "./AuthService/AuthService";
import { PermissionService } from "./PermissionService/PermissionService";
import { UserService } from "./UserService/UserService";

/**
 * Controller per la gestione degli accessi e delle operazioni correlate.
 * Fornisce metodi per login, registrazione, crittografia, decrittografia e gestione delle autorizzazioni utente.
 */
@autobind
export class AccessiController {
    private logger: Logger = new Logger(AccessiController.name);

    /**
     * Costruttore del controller.
     * @param accessiModel Istanza del modello di gestione degli accessi.
     * @param jwtOptions Opzioni di configurazione per la generazione dei token JWT.
     * @author mttdev382
     
     */
    constructor(private userService: UserService, private permissionService: PermissionService, private authService: AuthService) { }

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
    public async getUserByToken(req: Request<{}, {}, { token: string }>, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                return RestUtilities.sendErrorMessage(res, "Token non fornito", AccessiController.name);
            }

            const jwtOptions = this.authService.getOptions().jwtOptions;

            // Decodifica il token JWT
            const decoded = jwt.verify(token, jwtOptions.secret);

            if (!decoded) {
                return RestUtilities.sendUnauthorized(res);
            }

            return RestUtilities.sendBaseResponse(res, { userData: decoded });
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async login(req: Request, res: Response) {
        try {
            let request = req.body;
            const userData = await this.authService.login(request);

            if (!userData) return RestUtilities.sendInvalidCredentials(res);


            const jwtOptions = this.authService.getOptions().jwtOptions;

            userData.token = {
                expiresIn: jwtOptions.expiresIn,
                value: jwt.sign({ userData }, jwtOptions.secret, { expiresIn: jwtOptions.expiresIn }),
                type: "Bearer"
            }

            return RestUtilities.sendBaseResponse(res, userData);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

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
    public async getUsers(req: Request, res: Response) {
        try {
            const users = await this.userService.getUsers();
            return RestUtilities.sendBaseResponse(res, users);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

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
    public async deleteUser(req: Request, res: Response) {
        try {
            const { codiceUtente } = req.body;

            if (!codiceUtente) {
                throw new Error('CODUTE mancante');
            }

            await this.userService.deleteUser(codiceUtente);
            return RestUtilities.sendOKMessage(res, 'Utente eliminato con successo');
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error);
        }
    }


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
    public async register(req: Request, res: Response) {
        try {
            let request = req.body;
            await this.userService.register(request);

            return RestUtilities.sendOKMessage(res, "Utente registrato con successo");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

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
    public async encrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {

            const key = this.authService.getOptions().encryptionKey;
            let encryptedData = CryptUtilities.encrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

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
    public async decrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            const key = this.authService.getOptions().encryptionKey;
            let decryptedData = CryptUtilities.decrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

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
    public async resetAbilitazioni(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.permissionService.resetAbilitazioni(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `Abilitazioni resettate con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

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
    public async setPassword(req: Request<{}, {}, { codiceUtente: string, nuovaPassword: string }>, res: Response) {
        try {
            await this.authService.setPassword(req.body.codiceUtente, req.body.nuovaPassword);
            return RestUtilities.sendOKMessage(res, `Password impostata con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async updateUtente(req: Request, res: Response) {
        try {
            let user = req.body;
            await this.userService.updateUser(user);
            return RestUtilities.sendOKMessage(res, `Utente ${req.body.codiceUtente} aggiornato con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async setGdpr(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.userService.setGdpr(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `GDPR accettato con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

}
