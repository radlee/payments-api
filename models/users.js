// models/users.js
const users = [
    { userId: 'user123', name: 'John Doe' },
    { userId: 'user456', name: 'Jane Smith' }
  ];
  
  const isValidUser = (userId) => {
    return users.some(user => user.userId === userId);
  };
  
  module.exports = { isValidUser };
  