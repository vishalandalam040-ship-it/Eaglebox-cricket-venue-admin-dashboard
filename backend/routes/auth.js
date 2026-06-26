const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const crypto = require('crypto');

module.exports = (db) => {
  const router = express.Router();

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Fetch active or expired membership for user
      const membership = await db.get('SELECT plantype AS "planType", status FROM memberships WHERE email = ? ORDER BY startdate DESC LIMIT 1', [email]);
      const membershipDisplay = membership ? (membership.status === 'Active' ? membership.planType : `${membership.planType} (Expired)`) : null;

      // Create JWT Payload
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        membership: membershipDisplay
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      res.json({ token, user: { id: user.id, email: user.email, role: user.role, membership: membershipDisplay } });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ error: 'Server error during login' });
    }
  });

  // POST /api/auth/register (Basic registration for Staff/Viewer, Super Admin is seeded)
  router.post('/register', async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // By default, prevent registering as Super Admin via public endpoint
      // Realistically, only Super Admins should be able to create other users, 
      // but for this internship project, we allow basic registration of Staff/Viewers.
      const assignedRole = (role === 'Super Admin') ? 'Staff' : (role || 'Viewer');

      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already been used, use another email for signing up' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = crypto.randomUUID();

      await db.run(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [id, email, hashedPassword, assignedRole]
      );

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Registration Error:', err);
      res.status(500).json({ error: 'Server error during registration' });
    }
  });

  return router;
};
