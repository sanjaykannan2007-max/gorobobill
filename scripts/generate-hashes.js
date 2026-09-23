const bcrypt = require('bcryptjs');

const users = [
  { username: 'shree', rawPass: 'shree123' },
  { username: 'sanjay', rawPass: 'sanjay123' },
  { username: 'niranjan', rawPass: 'niranjan123' }
];

console.log('=== SECURE USER PASSWORDS & BCRYPT HASHES ===');
users.forEach(u => {
  const hash = bcrypt.hashSync(u.rawPass, 10);
  console.log(`User: ${u.username}`);
  console.log(`Password: ${u.rawPass}`);
  console.log(`Hash: ${hash}`);
  console.log('-------------------------------------------');
});
