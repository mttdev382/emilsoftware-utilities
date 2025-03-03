import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import { AccessiModule } from "./AccessiModule";



export async function initializeAccessiModule(app: Application, options: any) {
    try {
        // Creiamo un'istanza Express separata per NestJS
        const nestExpressInstance = new ExpressAdapter(app);

        // Creiamo l'app NestJS attaccata a Express
        const nestApp = await NestFactory.create(AccessiModule.forRoot(options), nestExpressInstance, {
            bufferLogs: true
        });

        nestApp.enableCors();


        await nestApp.init();

        serveSwaggerDocs(nestApp);

        console.log('Verifica API NestJS registrate:');
        const expressInstance = nestApp.getHttpAdapter().getInstance();

        const router = expressInstance.router;

        const availableRoutes: [] = router.stack
            .map(layer => {
                if (layer.route) {
                    return {
                        route: {
                            path: layer.route?.path,
                            method: layer.route?.stack[0].method,
                        },
                    };
                }
            })
            .filter(item => item !== undefined);
        console.log(availableRoutes);

    } catch (error) {
        console.error("Errore in initializeAccessiModule:", error);
        throw error;
    }
}

export { AccessiModule } from "./AccessiModule";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { ILoginResult } from "./Services/AuthService/IAuthService";