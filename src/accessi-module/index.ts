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
    const nestExpressInstance = express(); // Istanza separata di Express per NestJS
    const expressAdapter = new ExpressAdapter(nestExpressInstance);

    // Creiamo l'app NestJS con l'adapter corretto
    const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, { bufferLogs: true });

    // Abilitiamo CORS per evitare problemi con richieste da browser
    nestApp.enableCors();

    // Inizializziamo NestJS
    await nestApp.init();

    // 🛠️ Importante: Usa `nestExpressInstance` per montare le API su /api/accessi
    app.use('/api/accessi', nestExpressInstance);

    // Serviamo Swagger
    serveSwaggerDocs(nestApp);

    // Debug: Verifica se le rotte di NestJS sono registrate
    console.log(
      'NestJS Routes:',
      nestApp.getHttpServer()._events.request._router.stack
        .map((r: any) => r.route?.path)
        .filter(Boolean)
    );
}

