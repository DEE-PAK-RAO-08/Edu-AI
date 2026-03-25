const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'edu_ai_secret_key_2026';

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.studentId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { auth, JWT_SECRET };
