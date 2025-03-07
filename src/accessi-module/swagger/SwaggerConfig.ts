import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle("Accessi API")
        .setDescription("API per la gestione degli accessi utenti")
        .setVersion("1.0")
        .addBearerAuth() // Per abilitare l'autenticazione JWT
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, document);

    console.log("✅ Swagger disponibile su: http://localhost:3000/swagger");
}
