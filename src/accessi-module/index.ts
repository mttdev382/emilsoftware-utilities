import { Application } from "express";
import { AccessiModule } from "./AccessiModule";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { AccessiModule } from "./AccessiModule";
export { ILoginResult } from "./Services/AuthService/IAuthService"

  export async function initializeAccessiModule(app: Application, options: any) {
    const expressAdapter = new ExpressAdapter(app);

    const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, { bufferLogs: true });

    // Monta NestJS solo su /api/accessi
    app.use('/api/accessi', expressAdapter.getInstance());

    nestApp.enableCors();
    nestApp.setGlobalPrefix('/accessi'); // Rimuovilo se causa problemi

    await nestApp.init();

    // Servi Swagger solo per Accessi
    serveSwaggerDocs(nestApp);
}
