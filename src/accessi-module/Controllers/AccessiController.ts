import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { autobind } from "../../autobind";
import { CryptUtilities, RestUtilities } from "../../Utilities";
import { IAuthService } from "../Services/AuthService/IAuthService";
import { IEmailService } from "../Services/EmailService/IEmailService";
import { IPermissionService } from "../Services/PermissionService/IPermissionService";
import { IUserService } from "../Services/UserService/IUserService";
import { inject } from "inversify";
import { AccessiControllerBase } from "./AccessiControllerBase";
import { AccessiOptions } from "../AccessiModule";

/**
 * Controller per la gestione degli accessi e delle operazioni correlate.
 * Fornisce metodi per login, registrazione, crittografia, decrittografia e gestione delle autorizzazioni utente.
 */
@autobind
export class AccessiController implements AccessiControllerBase {

    constructor(
        @inject("IUserService") private userService: IUserService,
        @inject("IPermissionService") private permissionService: IPermissionService,
        @inject("IAuthService") private authService: IAuthService,
        @inject("IEmailService") private emailService: IEmailService,

        @inject("AccessiOptions") private accessiOptions: AccessiOptions
    ) { }

    public async getUserByToken(req: Request<{}, {}, { token: string }>, res: Response) {
        try {
            const { token } = req.body;

            if (!token) {
                return RestUtilities.sendErrorMessage(res, "Token non fornito", AccessiController.name);
            }

            // Decodifica il token JWT
            const decoded = jwt.verify(token, this.accessiOptions.jwtOptions.secret);

            if (!decoded) {
                return RestUtilities.sendUnauthorized(res);
            }

            return RestUtilities.sendBaseResponse(res, { userData: decoded });
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }



    public async login(req: Request, res: Response) {
        try {
            let request = req.body;
            const userData = await this.authService.login(request);

            if (!userData) return RestUtilities.sendInvalidCredentials(res);



            userData.token = {
                expiresIn: this.accessiOptions.jwtOptions.expiresIn,
                value: jwt.sign({ userData }, this.accessiOptions.jwtOptions.secret, { expiresIn: this.accessiOptions.jwtOptions.expiresIn as any }),
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
                throw new Error('Il campo "Codice Utente" è obbligatorio.');
            }

            await this.userService.deleteUser(codiceUtente);
            return RestUtilities.sendOKMessage(res, "L'utente è stato eliminato con successo.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error);
        }
    }


    public async register(req: Request, res: Response) {
        try {
            let request = req.body;
            await this.userService.register(request);

            return RestUtilities.sendOKMessage(res, "L'utente è stato registrato con successo.");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async encrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {

            const key = this.accessiOptions.encryptionKey;
            let encryptedData = CryptUtilities.encrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, encryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async decrypt(req: Request<{}, {}, { data: string }>, res: Response) {
        try {
            const key = this.accessiOptions.encryptionKey;
            let decryptedData = CryptUtilities.decrypt(req.body.data, key);
            return RestUtilities.sendBaseResponse(res, decryptedData);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async resetAbilitazioni(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.permissionService.resetAbilitazioni(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `Le abilitazioni dell'utente ${req.body.codiceUtente} sono state resettate con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async setPassword(req: Request<{}, {}, { codiceUtente: string, nuovaPassword: string }>, res: Response) {
        try {
            await this.authService.setPassword(req.body.codiceUtente, req.body.nuovaPassword);
            return RestUtilities.sendOKMessage(res, `La password dell'utente ${req.body.codiceUtente} è stata impostata correttamente.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async updateUtente(req: Request, res: Response) {
        try {
            let user = req.body;
            await this.userService.updateUser(user);
            return RestUtilities.sendOKMessage(res, `L'utente ${req.body.codiceUtente} è stato aggiornato con successo.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    public async setGdpr(req: Request<{}, {}, { codiceUtente: string }>, res: Response) {
        try {
            await this.userService.setGdpr(req.body.codiceUtente);
            return RestUtilities.sendOKMessage(res, `L'utente ${req.body.codiceUtente} ha accettato il GDRP.`);
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }


    public async verifyEmail(req: Request<{ token: string }>, res: Response) {
        try {
            await this.userService.verifyEmail(req.params.token);

            return RestUtilities.sendOKMessage(res, "Email verificata con successo!");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    public async requestPasswordReset(req: Request, res: Response) {
        try {
            await this.emailService.sendPasswordResetEmail(req.body.email, req.headers.origin as string);
            return RestUtilities.sendOKMessage(res, "Email di reset inviata!");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

    public async resetPassword(req: Request<{ token: string }, {}, { newPassword: string }>, res: Response) {
        try {

            await this.authService.resetPassword(req.params.token, req.body.newPassword);

            return RestUtilities.sendOKMessage(res, "Password aggiornata con successo!");
        } catch (error) {
            return RestUtilities.sendErrorMessage(res, error, AccessiController.name);
        }
    }

}
