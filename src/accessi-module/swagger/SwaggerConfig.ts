import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';


export function serveSwaggerDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Accessi API')
    .setDescription('Documentazione delle API per la gestione degli accessi')
    .setVersion('1.0')
    .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, documentFactory);

  console.log('Swagger UI disponibile su http://localhost:3000/swagger/accessi');
}
