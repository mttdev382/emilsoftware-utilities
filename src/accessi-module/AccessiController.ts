import { Logger } from "../Logger";
import { CryptUtilities, RestUtilities } from "../Utilities";
import { AccessiModel } from "./AccessiModel";
import { Response, Request } from "express";
import { LoginRequest } from "./models/DTO/LoginRequest";
import jwt from "jsonwebtoken";
import { JwtOptions } from "./models/JwtOptions";
import { autobind } from "../autobind";
import { RegisterRequest } from "./models/DTO/RegisterRequest";

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
    constructor(private accessiModel: AccessiModel) { }

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
    public async login(req: Request<{}, {}, LoginRequest>, res: Response) {
        try {
            let request = req.body;
            const userData = await this.accessiModel.login(request);

            if (!userData) return RestUtilities.sendErrorMessage(res, "Credenziali errate", AccessiController.name);

            const jwtOptions = this.accessiModel.getOptions().jwtOptions;

            const token = jwt.sign({ userData }, jwtOptions.secret, { expiresIn: jwtOptions.expiresIn });

            return RestUtilities.sendBaseResponse(res, token);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
        try {
            let request = req.body;
            await this.accessiModel.register(request);

            return RestUtilities.sendOKMessage(res, "Utente registrato con successo");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

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
    public async encrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {

            const key = this.accessiModel.getOptions().encryptionKey;
            let encryptedData = CryptUtilities.encrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async decrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            const key = this.accessiModel.getOptions().encryptionKey;
            let decryptedData = CryptUtilities.decrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async resetAbilitazioni(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.accessiModel.resetAbilitazioni(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `Abilitazioni resettate con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async setPassword(req: Request<{}, {}, { codiceUtente: string, nuovaPassword: string }>, res: Response) {
        try {
            await this.accessiModel.setPassword(req.body.codiceUtente, req.body.nuovaPassword);
            return RestUtilities.sendOKMessage(res, `Password impostata con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


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
    public async setGdpr(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.accessiModel.setGdpr(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `GDPR accettato con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

}
