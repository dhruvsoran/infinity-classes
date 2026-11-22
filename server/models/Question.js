const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: [(v) => v.length === 4 && v.every((o) => o && o.trim()), 'Exactly 4 non-empty options are required'],
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    subject: { type: String, default: 'General Knowledge', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
