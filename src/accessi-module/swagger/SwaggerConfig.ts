import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Application } from 'express';
import { INestApplication } from '@nestjs/common';

export function serveSwaggerDocs(app: INestApplication | Application) {
  const config = new DocumentBuilder()
    .setTitle('Accessi API')
    .setDescription('Documentazione delle API per la gestione degli accessi')
    .setVersion('1.0')
    .addServer('http://localhost:3000/api/accessi') // Cambia se necessario
    .build();

  const document = SwaggerModule.createDocument(app as INestApplication, config);
  
  SwaggerModule.setup('/swagger/accessi', app as INestApplication, document);
}
