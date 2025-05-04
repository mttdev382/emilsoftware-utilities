import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "../../Logger";

export function setupAccessiSwagger(app: INestApplication) {
    const logger: Logger = new Logger("SwaggerConfig");
    const swaggerPath = "swagger/accessi";
    const swaggerJsonPath = `${swaggerPath}-json`;

    const config = new DocumentBuilder()
        .setTitle("Accessi API")
        .setDescription("API per la gestione degli accessi utenti")
        .setVersion("1.0")
        .addBearerAuth() // Per abilitare l'autenticazione JWT
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document);

    app.use(`/${swaggerJsonPath}`, (_, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(document);
    });

    let port = app.getHttpServer()?.address?.port || 3000;

    logger.info(
        `Swagger disponibile su: http://localhost:${port}/${swaggerPath}`
    );
}
