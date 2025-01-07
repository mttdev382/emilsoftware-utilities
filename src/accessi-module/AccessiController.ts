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
    constructor(private accessiModel: AccessiModel, private jwtOptions: JwtOptions) { }

    /**
     * Effettua il login di un utente.
     * @param req Richiesta HTTP contenente i dati di login (username e password).
     * @param res Risposta HTTP per inviare il token JWT o un messaggio di errore.
     * @author mttdev382

     */
    public async login(req: Request<{}, {}, LoginRequest>, res: Response) {
        try {
            let request = req.body;
            const userData = await this.accessiModel.login(request);

            if (!userData) return RestUtilities.sendErrorMessage(res, "Credenziali errate", AccessiController.name);

            const token = jwt.sign({ userData }, this.jwtOptions.secret, { expiresIn: this.jwtOptions.expiresIn });

            return RestUtilities.sendBaseResponse(res, token);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    /**
     * Registra un nuovo utente.
     * @param req Richiesta HTTP contenente i dati di registrazione.
     * @param res Risposta HTTP per confermare l'operazione o inviare un messaggio di errore.
     * @author mttdev382

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
     * Crittografa i dati forniti.
     * @param req Richiesta HTTP contenente i dati da crittografare.
     * @param res Risposta HTTP con i dati crittografati o un messaggio di errore.
     * @author mttdev382

     */
    public async encrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            let encryptedData = CryptUtilities.encrypt(req.body.data, this.accessiModel.getKey());
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    /**
     * Decrittografa i dati forniti.
     * @param req Richiesta HTTP contenente i dati da decrittografare.
     * @param res Risposta HTTP con i dati decrittografati o un messaggio di errore.
     * @author mttdev382

     */
    public async decrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            let decryptedData = CryptUtilities.decrypt(req.body.data, this.accessiModel.getKey());
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    /**
     * Resetta le abilitazioni di un utente.
     * @param req Richiesta HTTP contenente il codice utente per il quale resettare le abilitazioni.
     * @param res Risposta HTTP per confermare l'operazione o inviare un messaggio di errore.
     * @author mttdev382

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
     * Imposta una nuova password per un utente.
     * @param req Richiesta HTTP contenente il codice utente e la nuova password.
     * @param res Risposta HTTP per confermare l'operazione o inviare un messaggio di errore.
     * @author mttdev382

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
     * Imposta il consenso GDPR per un utente.
     * @param req Richiesta HTTP contenente il codice utente.
     * @param res Risposta HTTP per confermare l'operazione o inviare un messaggio di errore.
     * @author mttdev382

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
