// models/accounts.js
const accounts = [
  { accountNumber: '123456', balance: 5000, name: 'Troy ', surname: 'Carlo' },
  { accountNumber: '654321', balance: 10000, name: 'Jane', surname: 'Smith' },
  { accountNumber: '987654', balance: 10000, name: 'Masizole', surname: 'Sukwana' },
  { accountNumber: '111222', balance: 7500, name: 'Alex', surname: 'Brown' },
  { accountNumber: '333444', balance: 12000, name: 'Maria', surname: 'Lopez' }
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
