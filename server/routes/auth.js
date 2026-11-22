const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e);

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !emailOk(email || '') || (password || '').length < 6)
      return res.status(400).json({ message: 'Enter your name, a valid email and a password of at least 6 characters.' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'An account with this email already exists. Try logging in.' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ message: 'Incorrect email or password.' });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
