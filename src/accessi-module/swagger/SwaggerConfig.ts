import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Definisci la configurazione di Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Accessi API',
    version: '1.0.0',
    description: 'Documentazione delle API per la gestione degli accessi',
  },
  servers: [
    {
      url: 'http://localhost:3000/api', // Modifica se necessario
    },
  ],
};

const options = {
  swaggerDefinition,
  // Specifica i file sorgenti che contengono le annotazioni Swagger
  apis: ['./src/accessi-module/*.ts'], // Aggiungi altri file se necessario
};


// Funzione per esporre la documentazione Swagger tramite Express
export function serveSwaggerDocs(app: any) {
  // Crea il documento Swagger
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-accessi-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
