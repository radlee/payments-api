// controllers/paymentController.js
const { getAccountDetails, processPayment } = require('../models/accounts');

const usedTransactionReferences = new Set(); // Set to store unique transaction references

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
 *       404:
 *         description: Account not found
 */
const viewAccountDetails = (req, res) => {
  const accountNumber = req.params.accountNumber;
  const account = getAccountDetails(accountNumber);

  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  res.json({
    accountNumber: account.accountNumber,
    balance: account.balance,
    name: account.name,
    surname: account.surname
  });
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
  const { accountNumber, amount, transactionReference } = req.body;

  if (!transactionReference) {
    return res.status(400).json({ message: 'Transaction reference is required.' });
  }

  if (usedTransactionReferences.has(transactionReference)) {
    return res.status(400).json({ message: 'Transaction reference has already been used.' });
  }

  const paymentResult = processPayment(accountNumber, amount);

  if (!paymentResult) {
    return res.status(400).json({ message: 'Payment failed. Insufficient balance or invalid account.' });
  }

  usedTransactionReferences.add(transactionReference);

  const updatedAccount = getAccountDetails(accountNumber);

  res.json({
    message: 'Payment successful',
    accountNumber: paymentResult.accountNumber,
    newBalance: paymentResult.newBalance,
    name: updatedAccount.name,
    surname: updatedAccount.surname,
    transactionReference: transactionReference
  });
};

module.exports = { viewAccountDetails, makePayment };
