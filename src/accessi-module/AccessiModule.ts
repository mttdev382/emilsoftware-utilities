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
import { PermissionService } from "./PermissionService/PermissionService";
import { UserService } from "./UserService/UserService";
import { AuthService } from "./AuthService/AuthService";

export interface AccessiOptions {
    databaseOptions: Options;
    encryptionKey: string;
    mockDemoUser: boolean;
    jwtOptions: JwtOptions;
}

@autobind
export class AccessiModule {
    private logger: Logger = new Logger(AccessiModule.name);

    private accessiRoutes: AccessiRoutes;
    private permissionService: PermissionService;
    private userService: UserService;
    private authService: AuthService;
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

        this.authService = new AuthService(accessiOptions);
        this.userService = new UserService(accessiOptions);
        this.permissionService = new PermissionService(accessiOptions);

        this.accessiController = new AccessiController(this.userService, this.permissionService, this.authService);
        this.accessiRoutes = new AccessiRoutes(this.accessiController);
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
 * Inizializza la documentazione di swagger per gli accessi.
 * @author mttdev382
 */
    public serveSwaggerDocs(app: any): void {
        serveSwaggerDocs(app);
    }
}
