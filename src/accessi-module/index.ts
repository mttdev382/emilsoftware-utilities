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
    // Creiamo una nuova istanza di Express dedicata a NestJS per evitare cicli
    const nestExpressInstance = express();

    // Creiamo un ExpressAdapter basato sulla nuova istanza
    const expressAdapter = new ExpressAdapter(nestExpressInstance);

    // Creiamo un'app NestJS con l'adapter Express
    const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, { bufferLogs: true });

    // Abilitiamo CORS solo su questa istanza
    nestApp.enableCors();

    // Avviamo NestJS senza avviare un nuovo server
    await nestApp.init();

    // Montiamo NestJS SOLO su /api/accessi, evitando cicli
    app.use('/api/accessi', nestExpressInstance);

    // Serviamo Swagger
    serveSwaggerDocs(nestApp);
}

