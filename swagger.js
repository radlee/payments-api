// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic Swagger definitions
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'API for handling payments and account details',
      contact: {
        name: 'YLolito',
        url: 'https://payments-api-beta.vercel.app',
        email: 'hello@flash.co.za'
      }
    },
    servers: [
      { url: 'https://payments-api-beta.vercel.app' } // Your deployed server URL
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to the files with Swagger comments
};

// Initialize Swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
