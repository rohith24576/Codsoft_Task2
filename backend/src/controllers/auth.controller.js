import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into users table
    const newUser = await pool.query(
      'INSERT INTO users (email, full_name, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, full_name, hashedPassword, 'Member']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.rows[0].id, email: newUser.rows[0].email, full_name: newUser.rows[0].full_name, role: newUser.rows[0].role },
      token: generateToken(newUser.rows[0].id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Logged in successfully',
      user: { id: user.rows[0].id, email: user.rows[0].email, full_name: user.rows[0].full_name, role: user.rows[0].role },
      token: generateToken(user.rows[0].id)
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

export const getUserProfile = async (req, res) => {
  res.json(req.user);
};
