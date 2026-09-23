const cookie = require('cookie');

module.exports = async function handler(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  }));

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};
