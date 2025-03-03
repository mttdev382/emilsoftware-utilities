import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function serveSwaggerDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Accessi API')
    .setDescription('Documentazione delle API per la gestione degli accessi')
    .setVersion('1.0')
    .addServer('/')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger/accessi', app, document, {
    customSiteTitle: 'Documentazione Accessi',
    swaggerOptions: {
      url: '/swagger/accessi-json'
    },
  });

  console.log('✅ Swagger UI disponibile su http://localhost:3000/swagger/accessi');
}
