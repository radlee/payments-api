window.onload = function() {
  //<editor-fold desc="Changeable Configuration Block">

  // Determine the environment
  const isProduction = window.location.hostname !== 'localhost';

  // Configure the Swagger UI URL based on the environment
  const swaggerUrl = isProduction ? 'https://payments-api-beta.vercel.app/static/swagger.json' : 'http://localhost:3000/swagger.json';

  window.ui = SwaggerUIBundle({
    url:  swaggerUrl,  // Use the appropriate URL based on the environment
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });

  //</editor-fold>
};
