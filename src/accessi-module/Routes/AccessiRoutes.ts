import { inject } from "inversify";
import { Logger } from "../../Logger";
import { AccessiController } from "../Controllers/AccessiController";
import { Router, Request, Response } from "express";
import { IAccessiRoutes } from "../IAccessiRoutes";
export class AccessiRoutes implements IAccessiRoutes {
    private logger: Logger = new Logger(AccessiRoutes.name);

    public router: Router;
    constructor(@inject("AccessiControllerBase") private accessiController: AccessiController) {
        this.router = Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        try {
            this.router.post(`/get-user-by-token`, this.accessiController.getUserByToken.bind(this.accessiController));
            this.router.post(`/login`, this.accessiController.login.bind(this.accessiController));
            this.router.post(`/get-users`, this.accessiController.getUsers.bind(this.accessiController));
            this.router.post(`/encrypt`, this.accessiController.encrypt.bind(this.accessiController));
            this.router.post(`/decrypt`, this.accessiController.decrypt.bind(this.accessiController));
            this.router.post(`/set-password`, this.accessiController.setPassword.bind(this.accessiController));
            this.router.post(`/update-utente`, this.accessiController.updateUtente.bind(this.accessiController));
            this.router.post(`/delete-utente`, this.accessiController.deleteUser.bind(this.accessiController));
            this.router.post(`/register`, this.accessiController.register.bind(this.accessiController));
            this.router.post(`/set-gdpr`, this.accessiController.setGdpr.bind(this.accessiController));
            this.router.post(`/reset-abilitazioni`, this.accessiController.resetAbilitazioni.bind(this.accessiController));


            this.router.get('/verify-email/:token', this.accessiController.verifyEmail.bind(this.accessiController));
            this.router.post('/reset-password', this.accessiController.requestPasswordReset.bind(this.accessiController));
            this.router.post('/reset-password/:token', this.accessiController.resetPassword.bind(this.accessiController));


        } catch (error: any) {
            this.logger.error("Si è verificato un errore:", error);
            throw error;
        }
    }

}