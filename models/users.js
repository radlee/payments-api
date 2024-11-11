// models/users.js
const users = [
  { userId: 'user123', name: 'John Doe' },
  { userId: 'user456', name: 'Jane Smith' },
  { userId: 'user789', name: 'Masizole Sukwana' },
  { userId: 'user321', name: 'Alex Brown' },
  { userId: 'user654', name: 'Maria Lopez' }
];

const isValidUser = (userId) => {
  return users.some(user => user.userId === userId);
};

module.exports = { isValidUser };
