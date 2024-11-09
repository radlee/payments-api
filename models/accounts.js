// models/accounts.js
const accounts = [
    { accountNumber: '123456', balance: 5000, name: 'John', surname: 'Doe' },
    { accountNumber: '654321', balance: 10000, name: 'Jane', surname: 'Smith' },
    { accountNumber: '987654', balance: 10000, name: 'Fatso 98', surname: 'Lenister' }
  ];
  
  const getAccountDetails = (accountNumber) => {
    return accounts.find(acc => acc.accountNumber === accountNumber);
  };
  
  const processPayment = (accountNumber, amount) => {
    const account = getAccountDetails(accountNumber);
    if (!account || account.balance < amount) return null;
  
    account.balance -= amount;
    return { accountNumber, newBalance: account.balance };
  };
  
  module.exports = { getAccountDetails, processPayment };
  