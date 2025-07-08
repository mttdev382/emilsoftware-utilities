import { Application } from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { setupSwagger } from "./swagger/SwaggerConfig";
import { Logger } from "./Logger";
import { EmilsoftwareModule, EmilsoftwareOptions } from "./EmilsoftwareModule";

/**
 * Initializes the unified module that combines Accessi and Allegati functionality
 * @param app Express application instance
 * @param options Configuration options for both modules
 */
export async function initEmilsoftwareModule(app: Application, options: EmilsoftwareOptions) {
    const logger: Logger = new Logger(initEmilsoftwareModule.name);

    try {
        const nestExpressInstance = new ExpressAdapter(app);
        const nestApp = await NestFactory.create(EmilsoftwareModule.forRoot(options), nestExpressInstance, {
            bufferLogs: true
        });

        nestApp.enableCors();

        nestApp.setGlobalPrefix('api', {
            exclude: ['/swagger', '/swagger/(.*)']
        });

        // Setup unified Swagger documentation for all modules
        setupSwagger(nestApp);

        await nestApp.init();

        logger.info("Emilsoftware module initialized successfully");

    } catch (error) {
        logger.error("Error initializing Emilsoftware Module:", error);
        throw error;
    }
} 