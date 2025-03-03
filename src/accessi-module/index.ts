import { Application } from "express";
import { AccessiModule } from "./AccessiModule";
import express from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { AccessiModule } from "./AccessiModule";
export { ILoginResult } from "./Services/AuthService/IAuthService"

export async function initializeAccessiModule(app: Application, options: any) {
    try {
        const nestExpressInstance = express(); // Istanza separata di Express
        const expressAdapter = new ExpressAdapter(nestExpressInstance);

        const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, { bufferLogs: true });

        nestApp.enableCors();
        await nestApp.init();

        // Montiamo NestJS su /api/accessi
        app.use('/api/accessi', nestExpressInstance);

        // Serviamo Swagger
        serveSwaggerDocs(nestApp);

    } catch (error) {
        console.error("Error occurred in initializeAccessiModule:", error);
        throw error; // Rilancia l'errore per vedere lo stack completo
    }
}


