// routes/api.js
const express = require('express');
const { viewAccountDetails, makePayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Account Details Endpoint (Protected)
router.get('/account/:accountNumber', authMiddleware, viewAccountDetails);

// Payment Endpoint (Protected)
router.post('/pay', authMiddleware, makePayment);

module.exports = router;
