/**
 * Modulo che gestisce le operazioni di accesso degli utenti, incluse le rotte, il controller e il modello.
 * 
 * @module AccessiModule
 * @author mttdev382
 */
import { Options } from "es-node-firebird";
import { Logger } from "../Logger";
import { Application, Router } from "express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import { container } from "./inversify.config";
import { IAccessiRoutes } from "./IAccessiRoutes";

export interface JwtOptions {
    secret: string
    expiresIn: string
}

export interface EmailOptions {
    host: string,
    port: number,
    secure: boolean,
    auth: {
        user: string,
        pass: string
    }
}

export interface AccessiOptions {
    databaseOptions: Options;
    encryptionKey: string;
    mockDemoUser: boolean;
    jwtOptions: JwtOptions;
    emailOptions: EmailOptions;
}


export class AccessiModule {
    private logger: Logger = new Logger(AccessiModule.name);
    private accessiRoutes: IAccessiRoutes;


    /**
     * Crea una nuova istanza del modulo Accessi.
     * 
     * @param {Options} databaseOptions - Le opzioni di configurazione per la connessione al database.
     * @param {string} encryptionKey - La chiave di cifratura per la gestione dei dati sensibili.
     * @param {JwtOptions} jwtOptions - Le opzioni per la gestione dei token JWT.
     * @author mttdev382

     */
    constructor(private options: AccessiOptions) {
        // Configura le opzioni di AccessiModule dentro il container DI
        container.bind<AccessiOptions>("AccessiOptions").toConstantValue(this.options);
    }

    public initialize() {
        this.accessiRoutes = container.get<IAccessiRoutes>("IAccessiRoutes");
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
    public serveSwaggerDocs(app: Application): void {
        serveSwaggerDocs(app);
    }
}
