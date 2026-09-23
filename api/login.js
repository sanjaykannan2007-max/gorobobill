const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'gorobo_super_secret_jwt_key_2026';

// Multi-user database — passwords are bcrypt hashed (saltRounds=10)
const USERS_DB = {
  shree: {
    name: 'Shree',
    username: 'shree',
    billingName: 'Shree',
    passwordHash: process.env.SHREE_PASSWORD_HASH || '$2a$10$arwoXkny.9w1fex0nPzf3.d5cziTIo8ZFF.MZLoPmWOJPVKWF3Fzm'
  },
  sanjay: {
    name: 'Sanjay',
    username: 'sanjay',
    billingName: 'Sanjay',
    passwordHash: process.env.SANJAY_PASSWORD_HASH || '$2a$10$nAYWqyjtRHic72LYcrgrb.i8miEFkJA7xzdVfLut7M12i/gHZzcXu'
  },
  niranjan: {
    name: 'Niranjan',
    username: 'niranjan',
    billingName: 'Niranjan',
    passwordHash: process.env.NIRANJAN_PASSWORD_HASH || '$2a$10$mhWE.WduUOCTzO.yG4N14.o2wPjSPQC.fnF1MPUUnNKvzmPm0V5XO'
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { username, password } = body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = USERS_DB[cleanUsername];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token (includes billingName for auto-fill)
    const token = jwt.sign(
      { username: user.username, name: user.name, billingName: user.billingName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    }));

    return res.status(200).json({
      success: true,
      user: { username: user.username, name: user.name, billingName: user.billingName }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
