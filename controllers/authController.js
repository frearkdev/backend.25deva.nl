// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, studentnummer, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Naam, email en wachtwoord zijn verplicht.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is al in gebruik.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, studentnummer, password) VALUES (?, ?, ?, ?)',
      [name, email, studentnummer || null, hashed]
    );

    res.json({ message: 'Gebruiker geregistreerd.' });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Onbekende gebruiker.' });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Onjuist wachtwoord.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        studentnummer: user.studentnummer,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentnummer: user.studentnummer,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error.' });
  }
};
