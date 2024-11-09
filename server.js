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
                bearerAuth: [],
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCssUrl: CSS_URL,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: "Too many requests from this IP, please try again later" },
});
app.use(limiter);

// Auth route for generating tokens (for testing)
app.post('/auth', (req, res) => {
    const { userId } = req.body;

    // Check if userId is valid
    if (!isValidUser(userId)) {
        return res.status(401).json({ message: 'Invalid userId' });
    }

    const token = generateToken(userId);
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
        <p>Generate a JWT token for secure API access by providing a valid user ID.</p>
        <pre class="code-block">POST /auth</pre>
        <p><strong>Request Body:</strong></p>
        <pre class="code-block">{
    "userId": "user123"
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
      "surname": "Doe",
      "currency": "ZAR"
    },
    "meta": {
      "rateLimit": {
        "limit": 1000,
        "remaining": 999,
        "resetTime": 1731189600000
      }
    }
  }</pre>
        <p><strong>Error Responses:</strong></p>
        <pre class="code-block">{
    "status": "error",
    "message": "Account not found",
    "statusCode": "AC-002",
    "data": {},
    "meta": {}
  }</pre>
        <p><strong>Error Code: AC-002</strong> - Account not found</p>
    
        <h3 class="endpoint-title">3. Make a Payment</h3>
        <p>Submit a payment request by sending the required payment details. Include the JWT token in the Authorization header.</p>
        <pre class="code-block">POST /api/pay</pre>
        <p><strong>Request Body Example:</strong></p>
        <pre class="code-block">{
    "amount": 500,
    "accountNumber": "123456",
    "transactionReference": "TX123456789"
  }</pre>
        <p><strong>Example Response:</strong></p>
        <pre class="code-block">{
    "status": "success",
    "message": "Payment successful",
    "statusCode": "AP-001",
    "data": {
      "transaction": {
        "accountNumber": "123456",
        "transactionReference": "TX123456789",
        "amount": 500,
        "currency": "ZAR",
        "newBalance": 4900,
        "transactionTime": "2024-11-09T19:03:28.499Z"
      },
      "accountHolder": {
        "name": "Masizole",
        "surname": "Skunana"
      }
    },
    "meta": {
      "rateLimit": {
        "limit": 1000,
        "remaining": 999,
        "resetTime": 1731189600000
      }
    }
  }</pre>
        <p><strong>Error Responses:</strong></p>
        <pre class="code-block">{
    "status": "error",
    "message": "Transaction reference is required.",
    "statusCode": "AP-002",
    "data": {},
    "meta": {}
  }</pre>
        <p><strong>Error Code: AP-002</strong> - Invalid or missing transaction reference</p>
        <pre class="code-block">{
    "status": "error",
    "message": "Transaction reference has already been used.",
    "statusCode": "AP-002",
    "data": {},
    "meta": {}
  }</pre>
        <p><strong>Error Code: AP-002</strong> - Transaction reference has already been used</p>
        <pre class="code-block">{
    "status": "error",
    "message": "Payment failed. Insufficient balance or invalid account.",
    "statusCode": "AP-002",
    "data": {},
    "meta": {}
  }</pre>
        <p><strong>Error Code: AP-002</strong> - Payment failure (Insufficient balance or invalid account)</p>
        <pre class="code-block">{
    "status": "error",
    "message": "Rate limit exceeded. Please try again later.",
    "statusCode": "AP-003",
    "data": {},
    "meta": {
      "resetTime": "2024-11-09T00:00:00Z"
    }
  }</pre>
        <p><strong>Error Code: AP-003</strong> - Rate limit exceeded</p>
    
        <h2>How to Use the API</h2>
        <p>To use this API, include the generated JWT token in the Authorization header for all secured endpoints.</p>
        <pre class="code-block">Authorization: Bearer your_jwt_token_here</pre>
    
        <h2>Additional Resources</h2>
        <p>For more details, visit the full API documentation at <a href="/api-docs">/api-docs</a>.</p>
      </div>
    </body>
  </html>
  
  
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
