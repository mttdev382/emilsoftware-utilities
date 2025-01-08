/**
 * Modulo che gestisce le operazioni di accesso degli utenti, incluse le rotte, il controller e il modello.
 * 
 * @module AccessiModule
 * @author mttdev382
 */
import { Options } from "es-node-firebird";
import { AccessiModel } from "./AccessiModel";
import { AccessiController } from "./AccessiController";
import { AccessiRoutes } from "./AccessiRoutes";
import { Logger } from "../Logger";
import { Router } from "express";
import { JwtOptions } from "./models/JwtOptions";
import { autobind } from "../autobind";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";

export interface AccessiOptions {
    databaseOptions: Options;
    encryptionKey: string;
    mockDemoUser: boolean;
    jwtOptions: JwtOptions;
}

@autobind
export class AccessiModule {
    private logger: Logger = new Logger(AccessiModule.name);

    private accessiModel: AccessiModel;
    private accessiRoutes: AccessiRoutes;
    private accessiController: AccessiController;

    /**
     * Crea una nuova istanza del modulo Accessi.
     * 
     * @param {Options} databaseOptions - Le opzioni di configurazione per la connessione al database.
     * @param {string} encryptionKey - La chiave di cifratura per la gestione dei dati sensibili.
     * @param {JwtOptions} jwtOptions - Le opzioni per la gestione dei token JWT.
     * @author mttdev382

     */
    constructor(accessiOptions: AccessiOptions) {
        this.accessiModel = new AccessiModel(accessiOptions);
        this.accessiController = new AccessiController(this.accessiModel);
        this.accessiRoutes = new AccessiRoutes(this.accessiController);
    }

    /**
     * Ottiene il modello degli accessi.
     * 
     * **Attenzione:** Questo metodo non dovrebbe essere usato direttamente, in quanto può esporre la logica interna del modello.
     * 
     * @returns {AccessiModel} Il modello degli accessi.
     * @author mttdev382
     */
    private getAccessiModel(): AccessiModel {
        this.logger.warning("ATTENZIONE: molto probabilmente non dovresti usare questo metodo (getAccessiModel).");
        return this.accessiModel;
    }

    /**
     * Ottiene il router delle rotte per gestire gli accessi.
     * 
     * **Consiglio:** È consigliabile utilizzare questo router nel primo livello della tua applicazione (es. /api/accessi).
     * 
     * @returns {Router} Il router con le rotte degli accessi.
     * @author mttdev382
     */
    public getAccessiRouter(): Router {
        this.logger.info(`Importazione delle rotte di 'ACCESSI', è consigliabile utilizzarle nel primo livello della tua applicazione (es. /api/accessi).`);
        return this.accessiRoutes.router;
    }

    /**
     * Ottiene il controller degli accessi.
     * 
     * **Attenzione:** Questo metodo non dovrebbe essere usato direttamente, in quanto espone la logica del controller.
     * 
     * @returns {AccessiController} Il controller per la gestione degli accessi.
     * @author mttdev382
     */
    private getAccessiController(): AccessiController {
        this.logger.warning(`ATTENZIONE: molto probabilmente non dovresti usare questo metodo (getAccessiController).`);
        return this.accessiController;
    }


    /**
 * Inizializza la documentazione di swagger per gli accessi.
 * @author mttdev382
 */
    public serveSwaggerDocs(app: any): void {
        serveSwaggerDocs(app);
    }
}
