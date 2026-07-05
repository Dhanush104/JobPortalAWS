const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, company_name, bio, skills } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please include all required fields (name, email, password, role)' });
  }

  if (role !== 'seeker' && role !== 'employer') {
    return res.status(400).json({ message: 'Invalid role. Must be either seeker or employer' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, company_name, bio, skills) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, company_name || null, bio || null, skills || null]
    );

    const userId = result.insertId;

    res.status(201).json({
      token: generateToken(userId, email, role),
      user: {
        id: userId,
        name,
        email,
        role,
        company_name: company_name || null,
        bio: bio || null,
        skills: skills || null
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user.id, user.email, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_name: user.company_name,
        bio: user.bio,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, company_name, bio, skills, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Fetch Me Error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

module.exports = { registerUser, loginUser, getMe };
