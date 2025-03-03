import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import { AccessiModule } from "./AccessiModule";



export async function initializeAccessiModule(app: Application, options: any) {
    try {
        // ATTACCA NestJS DIRETTAMENTE ALLA TUA `app` EXPRESS ESISTENTE
        const expressAdapter = new ExpressAdapter(app);

        // Crea un'istanza NestJS usando l'Express esistente
        const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, {
            bufferLogs: true
        });

        nestApp.enableCors();
        nestApp.setGlobalPrefix('api/accessi'); // Assicura che tutte le API di NestJS vadano sotto `/api/accessi`

        await nestApp.init(); // ATTACCA NESTJS DIRETTAMENTE AD EXPRESS!

        // Serviamo Swagger (ora sarà visibile su `/swagger/accessi`)
        serveSwaggerDocs(nestApp);

        console.log('NestJS AccessiModule inizializzato e attaccato a Express!');

    } catch (error) {
        console.error("Errore in initializeAccessiModule:", error);
        throw error; 
    }
}

export { AccessiModule } from "./AccessiModule";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { ILoginResult } from "./Services/AuthService/IAuthService";