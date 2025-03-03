import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import { AccessiModule } from "./AccessiModule";



export async function initializeAccessiModule(app: Application, options: any) {
    try {
        const expressAdapter = new ExpressAdapter(app); // 🔥 Usiamo la tua app Express esistente!

        const nestApp = await NestFactory.create(AccessiModule.forRoot(options), expressAdapter, {
            bufferLogs: true
        });

        nestApp.enableCors();
        nestApp.setGlobalPrefix('api/accessi'); // 🔥 Prefisso API per NestJS

        await nestApp.init(); // 🚀 Ora NestJS è attaccato a Express!

        serveSwaggerDocs(nestApp);

        console.log('✅ NestJS AccessiModule inizializzato con successo!');
    } catch (error) {
        console.error("❌ Errore in initializeAccessiModule:", error);
        throw error;
    }
}

export { AccessiModule } from "./AccessiModule";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { ILoginResult } from "./Services/AuthService/IAuthService";