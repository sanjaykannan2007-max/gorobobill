const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'gorobo_super_secret_jwt_key_2026';

// Multi-user database configuration (Can also be overridden via environment variables in Vercel)
// Default credentials provided (shree: shree123, sanjay: sanjay123, niranjan: niranjan123)
const USERS_DB = {
  shree: {
    name: 'Shree',
    username: 'shree',
    passwordHash: process.env.SHREE_PASSWORD_HASH || bcrypt.hashSync('shree123', 10)
  },
  sanjay: {
    name: 'Sanjay',
    username: 'sanjay',
    passwordHash: process.env.SANJAY_PASSWORD_HASH || bcrypt.hashSync('sanjay123', 10)
  },
  niranjan: {
    name: 'Niranjan',
    username: 'niranjan',
    passwordHash: process.env.NIRANJAN_PASSWORD_HASH || bcrypt.hashSync('niranjan123', 10)
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

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, name: user.name },
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
      user: { username: user.username, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
