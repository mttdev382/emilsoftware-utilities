import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { autobind } from "../autobind";
import { CryptUtilities, RestUtilities } from "../Utilities";
import { IAuthService } from "./Services/AuthService/IAuthService";
import { IEmailService } from "./Services/EmailService/IEmailService";
import { IPermissionService } from "./Services/PermissionService/IPermissionService";
import { IUserService } from "./Services/UserService/IUserService";
import { inject } from "inversify";
import { AccessiControllerBase } from "./AccessiControllerBase";

/**
 * Controller per la gestione degli accessi e delle operazioni correlate.
 * Fornisce metodi per login, registrazione, crittografia, decrittografia e gestione delle autorizzazioni utente.
 */
@autobind
export class AccessiController implements AccessiControllerBase {

    constructor(
        @inject("IUserService") private userService: IUserService,
        @inject("IPermissionService") private permissionService: IPermissionService,
        @inject("IEmailService") private emailService: IEmailService,
        @inject("IAuthService") private authService: IAuthService
    ) { }

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



    public async login(req: Request, res: Response){
        try {
            let request = req.body;
            const userData = await this.authService.login(request);

            if (!userData) return RestUtilities.sendInvalidCredentials(res);


            const jwtOptions = this.authService.getOptions().jwtOptions;


            userData.token = {
                expiresIn: jwtOptions.expiresIn,
                value: jwt.sign({ userData }, jwtOptions.secret, { expiresIn: jwtOptions.expiresIn as any }),
                type: "Bearer"
            }

            return RestUtilities.sendBaseResponse(res, userData);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }

    public async getUsers(req: Request, res: Response) {
        try {
            const users = await this.userService.getUsers();
            return RestUtilities.sendBaseResponse(res, users);
        } catch (error) {
            return RestUtilities.sendInvalidCredentials(res);
        }
    }


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


    public async register(req: Request, res: Response) {
        try {
            let request = req.body;
            await this.userService.register(request);

            return RestUtilities.sendOKMessage(res, "Utente registrato con successo");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async encrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {

            const key = this.authService.getOptions().encryptionKey;
            let encryptedData = CryptUtilities.encrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async decrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            const key = this.authService.getOptions().encryptionKey;
            let decryptedData = CryptUtilities.decrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async resetAbilitazioni(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.permissionService.resetAbilitazioni(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `Abilitazioni resettate con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async setPassword(req: Request<{}, {}, { codiceUtente: string, nuovaPassword: string }>, res: Response) {
        try {
            await this.authService.setPassword(req.body.codiceUtente, req.body.nuovaPassword);
            return RestUtilities.sendOKMessage(res, `Password impostata con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async updateUtente(req: Request, res: Response) {
        try {
            let user = req.body;
            await this.userService.updateUser(user);
            return RestUtilities.sendOKMessage(res, `Utente ${req.body.codiceUtente} aggiornato con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    public async setGdpr(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.userService.setGdpr(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `GDPR accettato con successo per l'utente ${req.body.codiceUtente}`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

}
