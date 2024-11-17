// server.js
const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { generateToken } = require('./config/auth');
const { isValidUser } = require('./models/users');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath()

dotenv.config();
const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Payment Service API",
            version: "1.0.0",
            description: "API for managing payments and account details.",
            contact: {
                name: "Lolito",
                email: "hello@flash.co.za",
            },
        },
        servers: [
            { url: "https://payments-api-beta.vercel.app" },  // Production URL
            { url: "http://localhost:3000" }                   // Localhost URL
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [], // This applies to all endpoints requiring token
            },
        ],
    },
    apis: ['./controllers/paymentController.js', './server.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Serve static Swagger files
const swaggerRoot = process.env.NODE_ENV === 'development' ? '/' : '/swagger';
app.use(swaggerRoot, express.static(path.join(__dirname, 'swagger-static')));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: "Too many requests from this IP, please try again later" },
});
app.use(limiter);

// Auth route for generating tokens using client credentials (for testing)
app.post('/auth', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body;

  // Check if grant_type, client_id, and client_secret are provided
  if (!grant_type || !client_id || !client_secret) {
      return res.status(400).json({ message: "grant_type, client_id, and client_secret are required" });
  }

  // Validate grant_type
  if (grant_type !== 'client_credentials') {
      return res.status(400).json({ message: "Invalid grant_type" });
  }

  // Validate client credentials
  if (!isValidUser(client_id, client_secret)) {
      return res.status(401).json({ message: 'Invalid client credentials' });
  }

  // Generate JWT token
  const token = generateToken(client_id, client_secret);
  res.json({ token });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
});

// API Routes
app.use('/api', apiRoutes);

// Welcoming route with extended documentation
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
      <title>Welcome to the Payment Service API</title>
      <link rel="stylesheet" type="text/css" href="${CSS_URL}" />
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; color: #333; }
        h1 { color: #4CAF50; }
        .container { max-width: 800px; margin: auto; text-align: left; }
        .code-block { background-color: #f4f4f4; padding: 10px; border-radius: 5px; color: #333; }
        .endpoint-title { color: #4CAF50; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to the Payment Service API</h1>
        <p>This server provides API endpoints for authentication, account details, and payment processing.</p>
        <p>API documentation is available at <a href="/api-docs">/api-docs</a></p>
    
        <h2>Endpoints</h2>
        <p>Below are the main endpoints in the correct usage order:</p>
    
        <h3 class="endpoint-title">1. Authentication</h3>
        <p>Generate a JWT token for secure API access by providing valid client credentials.</p>
        <pre class="code-block">POST /auth</pre>
        <p><strong>Request Body:</strong></p>
        <pre class="code-block">{
    "client_id": "client123",
    "client_secret": "secret123"
  }</pre>
        <p><strong>Response:</strong></p>
        <pre class="code-block">{
    "token": "your_jwt_token_here"
  }</pre>
    
        <h3 class="endpoint-title">2. View Account Details</h3>
        <p>Retrieve account details by providing an account number. Use the generated JWT token in the Authorization header.</p>
        <pre class="code-block">GET /api/account/:accountNumber</pre>
        <p><strong>Example Request:</strong></p>
        <pre class="code-block">GET /api/account/12345678</pre>
        <p><strong>Example Response:</strong></p>
        <pre class="code-block">{
    "status": "success",
    "message": "Account details retrieved successfully",
    "statusCode": "AC-001",
    "data": {
      "accountNumber": "12345678",
      "balance": 5000,
      "name": "John",
      "surname": "Doe"
    }
  }</pre>
    
        <h3 class="endpoint-title">3. Make Payment</h3>
        <p>Initiate a payment by providing payment details. Use the JWT token in the Authorization header.</p>
        <pre class="code-block">POST /api/pay</pre>
        <p><strong>Example Request Body:</strong></p>
        <pre class="code-block">{
    "amount": 100,
    "accountNumber": "12345678",
    "paymentMethod": "Credit Card"
  }</pre>
        <p><strong>Example Response:</strong></p>
        <pre class="code-block">{
    "status": "success",
    "message": "Payment processed successfully",
    "statusCode": "PAY-001",
    "data": {
      "transactionReference": "TXN123456",
      "amount": 100,
      "paymentMethod": "Credit Card"
    }
  }</pre>
      </div>
    </body>
    </html>
    `);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
