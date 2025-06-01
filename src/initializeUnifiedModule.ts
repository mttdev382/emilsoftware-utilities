import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { UnifiedModule, UnifiedModuleOptions } from "./UnifiedModule";
import { setupSwagger } from "./swagger/SwaggerConfig";
import { Logger } from "./Logger";

/**
 * Initializes the unified module that combines Accessi and Allegati functionality
 * @param app Express application instance
 * @param options Configuration options for both modules
 */
export async function initializeUnifiedModule(app: Application, options: UnifiedModuleOptions) {
    const logger: Logger = new Logger("initializeUnifiedModule");

    try {
        const nestExpressInstance = new ExpressAdapter(app);
        const nestApp = await NestFactory.create(UnifiedModule.forRoot(options), nestExpressInstance, {
            bufferLogs: true
        });

        nestApp.enableCors();

        nestApp.setGlobalPrefix('api', {
            exclude: ['/swagger', '/swagger/(.*)']
        });

        // Setup unified Swagger documentation for all modules
        setupSwagger(nestApp);

        await nestApp.init();

        logger.info("Unified module (Accessi + Allegati) initialized successfully");

    } catch (error) {
        logger.error("Error initializing UnifiedModule:", error);
        throw error;
    }
} 