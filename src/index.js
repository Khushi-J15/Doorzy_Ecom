const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Mock user storage (replace with MongoDB/MySQL in production)
const users = [];

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/auth/register', async (req, res) => {
  const { email, name, phoneNumber, password } = req.body;
  if (!email || !name || !phoneNumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: users.length + 1,
    email,
    name,
    phoneNumber,
    password: hashedPassword,
    role: 'USER' // Default role; set to 'ADMIN' for admin users
  };
  users.push(user);
  res.status(200).json({ message: 'Registration successful', userId: user.id });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, 'your-jwt-secret', { expiresIn: '1h' });
  res.status(200).json({ token, role: user.role });
});

// Product route (for Home.jsx)
app.get('/api/products', (req, res) => {
  const products = require('./data/products.json'); // Assumes products.json exists
  res.json(products);
});

app.listen(5000, () => console.log('Server running on port 5000'));