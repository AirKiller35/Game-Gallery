// Load environment variables first
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectDB = require('./db'); 
const User = require('./models/User'); 
const auth = require('./middleware/auth'); 

// Initialize Database
connectDB();

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors()); // Allows the React app (port 5173) to talk to this server

// --- AUTH API ROUTES ---

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user instance
    user = new User({ username, email, password });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save to MongoDB
    await user.save();

    // Return a JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        // Send back token AND user info
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Return JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. DELETE ACCOUNT (Protected)
app.delete('/api/users/me', auth, async (req, res) => {
  try {
    // req.user.id comes from the 'auth' middleware
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});