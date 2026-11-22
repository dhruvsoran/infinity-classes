const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [{ type: Number, default: -1 }], // same order as questions, -1 = unanswered
    score: { type: Number, default: 0 },
    total: { type: Number, default: 10 },
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
