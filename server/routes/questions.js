const router = require('express').Router();
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    res.json(await Question.find().sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { text, options, correctIndex, subject } = req.body;
    const q = await Question.create({ text, options, correctIndex, subject: subject || undefined });
    res.status(201).json(q);
  } catch (e) {
    if (e.name === 'ValidationError') return res.status(400).json({ message: Object.values(e.errors)[0].message });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
