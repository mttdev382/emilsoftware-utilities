import { Application } from "express";
import { AccessiModule, AccessiOptions } from "./AccessiModule";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import * as express from "express";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { AccessiModule } from "./AccessiModule";
export { ILoginResult } from "./Services/AuthService/IAuthService"



export async function initializeAccessiModule(app: Application, options: any) {
    // 1. Creiamo un'istanza di ExpressAdapter basata su `app`
    const expressAdapter = new ExpressAdapter(app);
  
    // 2. Creiamo Nest con l'ExpressAdapter
    const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter);
  
    // 3. Abilitiamo i middleware di Express (es. body-parser)
    nestApp.use(express.json());
    nestApp.use(express.urlencoded({ extended: true }));
  
    // 4. Avviamo NestJS (senza avviare un server separato)
    await nestApp.init();
  
    // 5. Serviamo automaticamente Swagger
    serveSwaggerDocs(nestApp);
  }