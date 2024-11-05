// controllers/paymentController.js
const { getAccountDetails, processPayment } = require('../models/accounts');

const usedTransactionReferences = new Set(); // Set to store unique transaction references

const viewAccountDetails = (req, res) => {
  const accountNumber = req.params.accountNumber; // Use req.params for GET route
  const account = getAccountDetails(accountNumber);

  if (!account) return res.status(404).json({ message: 'Account not found' });
  
  res.json({
    accountNumber: account.accountNumber,
    balance: account.balance,
    name: account.name,
    surname: account.surname
  });
};

const makePayment = (req, res) => {
  const { accountNumber, amount, transactionReference } = req.body;

  // Check if transactionReference was provided
  if (!transactionReference) {
    return res.status(400).json({ message: 'Transaction reference is required.' });
  }

  // Check for duplicate transaction reference
  if (usedTransactionReferences.has(transactionReference)) {
    return res.status(400).json({ message: 'Transaction reference has already been used.' });
  }

  // Process the payment
  const paymentResult = processPayment(accountNumber, amount);

  if (!paymentResult) {
    return res.status(400).json({ message: 'Payment failed. Insufficient balance or invalid account.' });
  }

  // If payment is successful, store the transaction reference
  usedTransactionReferences.add(transactionReference);

  // Fetch account details again to include name and surname in response
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
