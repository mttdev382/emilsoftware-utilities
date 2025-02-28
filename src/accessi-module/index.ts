import { Application } from "express";
import { AccessiModule, AccessiOptions } from "./AccessiModule";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";

export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { AccessiModule } from "./AccessiModule";
export { ILoginResult } from "./Services/AuthService/IAuthService"



export async function initializeAccessiModule(app: Application, options: AccessiOptions) {
    const nestApp = await NestFactory.create(AccessiModule.forRoot(options), new ExpressAdapter(app));
    await nestApp.init();
    serveSwaggerDocs(nestApp);
}