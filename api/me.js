const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'gorobo_super_secret_jwt_key_2026';

module.exports = async function handler(req, res) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      authenticated: true,
      user: { username: decoded.username, name: decoded.name }
    });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
};
