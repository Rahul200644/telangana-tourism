// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET = process.env.JWT_SECRET || 'telangana_secret';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });

  const existing = db.prepare('SELECT id FROM users WHERE username=? OR email=?').get(username, email);
  if (existing) return res.status(409).json({ error: 'Username or email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username,email,password) VALUES (?,?,?)').run(username, email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, username, role: 'user' }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, username, email, role: 'user' } });
});

// Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

module.exports = { router, authMiddleware };
