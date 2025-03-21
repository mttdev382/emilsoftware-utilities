import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const swaggerPath = "swagger/accessi";
const swaggerJsonPath = `${swaggerPath}-json`;

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle("Accessi API")
        .setDescription("API per la gestione degli accessi utenti")
        .setVersion("1.0")
        .addBearerAuth() // Per abilitare l'autenticazione JWT
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document);

    app.use(`/${swaggerJsonPath}`, (_, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });

    console.log("Swagger disponibile su: http://localhost:3000/"+swaggerPath);
    console.log(`Swagger JSON disponibile su: http://localhost:3000/${swaggerJsonPath}`);

}
