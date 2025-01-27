import { autobind } from "../autobind";
import { Logger } from "../Logger";
import { AccessiController } from "./AccessiController";
import { Router } from "express";

@autobind
export class AccessiRoutes {
    private logger: Logger = new Logger(AccessiRoutes.name);

    public router: Router;
    constructor(private accessiController: AccessiController) {
        this.router = Router();
        this.initializeRoutes();
    }


    private initializeRoutes() {
        try {
            this.router.post(`/get-user-by-token`, this.accessiController.getUserByToken);

            this.router.post(`/login`, this.accessiController.login);
            this.router.post(`/get-users`, this.accessiController.getUsers);
            this.router.post(`/encrypt`, this.accessiController.encrypt);
            this.router.post(`/decrypt`, this.accessiController.decrypt);
            this.router.post(`/set-password`, this.accessiController.setPassword);
            this.router.post(`/update-utente`, this.accessiController.updateUtente);
            this.router.post(`/register`, this.accessiController.register);

            this.router.post(`/set-gdpr`, this.accessiController.setGdpr);
            this.router.post(`/reset-abilitazioni`, this.accessiController.resetAbilitazioni);


        } catch (error: any) {
            this.logger.error("Si è verificato un errore:", error);
            throw error;
        }
    }

}