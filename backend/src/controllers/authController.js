const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

exports.register = async (req, res) => {
  const { name, email, password, role = 'consumer' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const allowedRoles = ['creator', 'consumer'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Role must be creator or consumer' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role
  });

  res.status(201).json({
    message: 'Registration successful',
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    token: generateToken(user._id),
    user: sanitizeUser(user)
  });
};

exports.me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};
