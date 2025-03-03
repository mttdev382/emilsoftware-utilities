import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { serveSwaggerDocs } from "./swagger/SwaggerConfig";
import { AccessiModule } from "./AccessiModule";
import express from "express";



export async function initializeAccessiModule(app: Application, options: any) {
    try {
        // Creiamo un'istanza Express separata per NestJS
        const nestExpressInstance = new ExpressAdapter(app);

        // Creiamo l'app NestJS attaccata a Express
        const nestApp = await NestFactory.create(AccessiModule.forRoot(options), nestExpressInstance, {
            bufferLogs: true
        });

        nestApp.enableCors();

        nestApp.setGlobalPrefix('api', {
            exclude: ['/swagger', '/swagger/(.*)']
        });

        await nestApp.init();

        serveSwaggerDocs(nestApp);

        console.log('Verifica API NestJS registrate:');
        const server = nestApp.getHttpAdapter().getInstance();
        const router = server.router;

        
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
        console.error("Errore in initialize AccessiModule:", error);
        throw error;
    }
}


async function start() {
    const app = express();

    await initializeAccessiModule(app, {
        databaseOptions: {
            host: '127.0.0.1',
            port: 3050,
            database: 'C:/Siti/Autoclub/ACCESSI.GDB',
            user: "SYSDBA",
            password: "masterkey",
        },

        encryptionKey: "BNB_KIT7GRP2023!",
        mockDemoUser: true,

        jwtOptions: {
            expiresIn: "24h",
            secret: "fabriziocorona",
        },

        emailOptions: {
            auth: {
                user: "form@emilsoftware.it",
                pass: "ForES713",
            },
            from: "noreply@emilsoftware.it",
            host: "smtp.qboxmail.com",
            port: 587,
            secure: false,
        },
        baseUrl: "http://localhost:3000"
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server avviato su http://localhost:${PORT}`);
    });
}

// start();

export { AccessiModule } from "./AccessiModule";
export { StatoRegistrazione } from "./models/StatoRegistrazione";
export { ILoginResult } from "./Services/AuthService/IAuthService";