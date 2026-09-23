const bcrypt = require('bcryptjs');

const users = [
  { username: 'shree', rawPass: 'shreenigga123' },
  { username: 'sanjay', rawPass: 'samurainightmare' },
  { username: 'niranjan', rawPass: 'ninjaniranmoosik' }
];

console.log('=== SECURE BCRYPT HASH GENERATION ===');
users.forEach(u => {
  const hash = bcrypt.hashSync(u.rawPass, 10);
  console.log(`Username: ${u.username}`);
  console.log(`Hash: ${hash}`);
});
