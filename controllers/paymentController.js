// controllers/paymentController.js
const { getAccountDetails, processPayment } = require('../models/accounts');

const usedTransactionReferences = new Set(); // Set to store unique transaction references
const rateLimit = { limit: 1000, remaining: 1000, resetTime: new Date().setHours(24, 0, 0, 0) }; // Example rate limit

/**
 * Helper function to respond with a standardized structure
 */
const respond = (res, status, message, statusCode, data = {}, meta = {}) => {
  res.status(status).json({ status: status === 200 ? "success" : "error", message, statusCode, data, meta });
};

/**
 * @swagger
 * /api/account/{accountNumber}:
 *   get:
 *     summary: View account details
 *     description: Retrieves account details for the specified account number.
 *     security:
 *       - bearerAuth: []  # Require authentication for this endpoint
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The account number to retrieve details for.
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountNumber:
 *                   type: string
 *                   example: "12345"
 *                 balance:
 *                   type: number
 *                   example: 5000
 *                 name:
 *                   type: string
 *                   example: "John"
 *                 surname:
 *                   type: string
 *                   example: "Doe"
 *                 currency:
 *                   type: string
 *                   example: "ZAR"
 *       404:
 *         description: Account not found
 */
const viewAccountDetails = (req, res) => {
  const accountNumber = req.params.accountNumber;
  const account = getAccountDetails(accountNumber);

  if (!account) {
    return respond(res, 404, 'Account not found', 'AC-002');
  }

  respond(res, 200, 'Account details retrieved successfully', 'AC-001', {
    accountNumber: account.accountNumber,
    balance: account.balance,
    name: account.name,
    surname: account.surname,
    currency: "ZAR"
  }, { rateLimit });
};

/**
 * @swagger
 * /api/pay:
 *   post:
 *     summary: Make a payment
 *     description: Processes a payment for the specified account number.
 *     security:
 *       - bearerAuth: []  # Require authentication for this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 description: The account number for the payment.
 *               amount:
 *                 type: number
 *                 description: The amount to be paid.
 *               transactionReference:
 *                 type: string
 *                 description: A unique transaction reference.
 *               currency:
 *                 type: string
 *                 description: The currency of the payment.
 *                 example: "ZAR"
 *     responses:
 *       200:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment successful
 *                 accountNumber:
 *                   type: string
 *                   example: "12345"
 *                 newBalance:
 *                   type: number
 *                   example: 900
 *                 name:
 *                   type: string
 *                   example: "John"
 *                 surname:
 *                   type: string
 *                   example: "Doe"
 *                 transactionReference:
 *                   type: string
 *                   example: "TX123456789"
 *       400:
 *         description: Payment failed or invalid transaction reference
 */
const makePayment = (req, res) => {
  const { accountNumber, amount, transactionReference, currency = "ZAR" } = req.body;

  // Check if transaction reference is provided
  if (!transactionReference) {
    return respond(res, 400, 'Transaction reference is required.', 'AP-002');
  }

  // Check if the transaction reference has already been used
  if (usedTransactionReferences.has(transactionReference)) {
    return respond(res, 400, 'Transaction reference has already been used.', 'AP-002');
  }

  // Check if the amount is provided and is a valid number
  if (!amount || isNaN(amount) || amount <= 0) {
    return respond(res, 400, 'Valid amount is required.', 'AP-002');
  }

  // Check rate limit: If requests exceed limit, deny further requests
  if (rateLimit.remaining <= 0) {
    return respond(res, 429, 'Rate limit exceeded. Please try again later.', 'AP-003', {}, { resetTime: rateLimit.resetTime });
  }

  // Process payment
  const paymentResult = processPayment(accountNumber, amount, currency);

  // If payment fails (insufficient balance or invalid account)
  if (!paymentResult) {
    return respond(res, 400, 'Payment failed. Insufficient balance or invalid account.', 'AP-002');
  }

  // Mark the transaction as used
  usedTransactionReferences.add(transactionReference);

  // Get updated account details
  const updatedAccount = getAccountDetails(accountNumber);

  // Update rate limit info (example of decrement)
  rateLimit.remaining -= 1;

  // Respond with success
  respond(res, 200, 'Payment successful', 'AP-001', {
    transaction: {
      accountNumber: paymentResult.accountNumber,
      transactionReference: transactionReference,
      amount,
      currency,
      newBalance: paymentResult.newBalance,
      transactionTime: new Date().toISOString()
    },
    accountHolder: {
      name: updatedAccount.name,
      surname: updatedAccount.surname
    }
  }, { rateLimit });
};

module.exports = { viewAccountDetails, makePayment };
