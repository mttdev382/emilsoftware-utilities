import { Options } from "es-node-firebird";
import { AccessiModel } from "./AccessiModel";
import { AccessiController } from "./AccessiController";
import { AccessiRoutes } from "./AccessiRoutes";
import autobind from "autobind-decorator";
import { Logger } from "../Logger";
import { Router } from "express";
import { JwtOptions } from "./models/JwtOptions";

@autobind
export class AccessiModule {
    private logger: Logger = new Logger(AccessiModule.name);

    private accessiModel: AccessiModel;
    private accessiRoutes: AccessiRoutes;
    private accessiController: AccessiController;

    constructor(databaseOptions: Options, encryptionKey: string, jwtOptions: JwtOptions) {
        
        this.accessiModel = new AccessiModel(databaseOptions, encryptionKey);
        this.accessiController = new AccessiController(this.accessiModel, jwtOptions);
        this.accessiRoutes = new AccessiRoutes(this.accessiController);
    }

    public getAccessiModel(): AccessiModel {
        this.logger.warning("ATTENZIONE: molto probabilmente non dovresti usare questo metodo (getAccessiModel).");
        return this.accessiModel;
    }

    public getAccessiRouter(): Router {
        this.logger.info("Importazione delle rotte di 'ACCESSI', è consigliabile utilizzarle nel primo livello della tua applicazione (es. /api/accessi).");
        return this.accessiRoutes.router;
    }

    public getAccessiController(): AccessiController {
        this.logger.warning("ATTENZIONE: molto probabilmente non dovresti usare questo metodo (getAccessiController).");
        return this.accessiController;
    }

}