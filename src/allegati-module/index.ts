import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AllegatiModule, AllegatiOptions } from "./AllegatiModule";
import { setupAllegatiSwagger } from "./swagger/SwaggerConfig";

import { Logger } from "../Logger";

export async function initializeAllegatiModule(app: Application, options: AllegatiOptions) {
    const logger: Logger = new Logger("initializeAllegatiModule");

    try {
        const nestExpressInstance = new ExpressAdapter(app);
        const nestApp = await NestFactory.create(AllegatiModule.forRoot(options), nestExpressInstance, {
            bufferLogs: true
        });

        nestApp.enableCors();

        nestApp.setGlobalPrefix('api', {
            exclude: ['/swagger', '/swagger/(.*)'] // oppure più fine
        });

        // (opzionale) puoi settare Swagger se vuoi:
        setupAllegatiSwagger(nestApp);

        await nestApp.init();

    } catch (error) {
        logger.error("Errore in initialize AllegatiModule:", error);
        throw error;
    }
}

export { AllegatiModule } from "./AllegatiModule";
export * from "./Dtos"; // per esportare automaticamente i DTOs tipo AllegatoDto, UploadAllegatoResponseDto, etc.