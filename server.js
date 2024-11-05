// server.js
const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const { generateToken } = require('./config/auth');
const { isValidUser } = require('./models/users');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        description: "API for managing payments and account details",
        contact: {
          name: "Lolito",
          email: "hello@flash.co.za",
        },
      },
      servers: [{ url: "https://payments-api-beta.vercel.app" }],
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

  // Error Handling Middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  // Check if userId is valid
  if (!isValidUser(userId)) {
    return res.status(401).json({ message: 'Invalid userId' });
  }

  const token = generateToken(userId);
  res.json({ token });
});

// API Routes
app.use('/api', apiRoutes);

// Welcoming route
app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Welcome to the Payment Service API</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #4CAF50; }
            p { color: #555; }
          </style>
        </head>
        <body>
          <h1>Welcome to the Payment Service API</h1>
          <p>This server provides API endpoints for account details and payments.</p>
          <p>Use <code>/api/account/:accountNumber</code> to view account details and <code>/api/pay</code> to make a payment.</p>
        </body>
      </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at https://payments-api-beta.vercel.app/api-docs`);
});
