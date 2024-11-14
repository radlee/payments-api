// models/users.js
const users = [
  { userId: 'user123', name: 'John Doe', client_id: 'client123', client_secret: 'secret123' },
  { userId: 'user456', name: 'Jane Smith', client_id: 'client456', client_secret: 'secret456' },
  { userId: 'user789', name: 'Masizole Sukwana', client_id: 'client789', client_secret: 'secret789' },
  { userId: 'user321', name: 'Alex Brown', client_id: 'client321', client_secret: 'secret321' },
  { userId: 'user654', name: 'Maria Lopez', client_id: 'client654', client_secret: 'secret654' }
];

// Check if the client credentials are valid
const isValidUser = (client_id, client_secret) => {
  return users.some(user => user.client_id === client_id && user.client_secret === client_secret);
};

// Find a user by client_id
const findUserByClientId = (client_id) => {
  return users.find(user => user.client_id === client_id);
};

module.exports = { isValidUser, findUserByClientId };
