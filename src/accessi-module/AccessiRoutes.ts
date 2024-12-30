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
            this.router.post(`/login`, this.accessiController.login);


        } catch (error: any) {
            this.logger.error("Si è verificato un errore:", error);
            throw error;
        }
    }

}