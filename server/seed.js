// Run once: npm run seed  -> creates an admin user + 12 sample questions (only if the DB is empty)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Question = require('./models/Question');

const ADMIN_EMAIL = 'admin@infinityclasses.com';
const ADMIN_PASSWORD = 'Admin@123';

const q = (text, options, correctIndex, subject = 'General Knowledge') => ({ text, options, correctIndex, subject });
const questions = [
  q('Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Mercury'], 1, 'Science'),
  q('What is the chemical symbol for water?', ['O2', 'CO2', 'H2O', 'HO'], 2, 'Science'),
  q('Which gas do plants absorb for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2, 'Science'),
  q('What is the SI unit of force?', ['Joule', 'Newton', 'Pascal', 'Watt'], 1, 'Science'),
  q('What is 15 × 12?', ['170', '180', '190', '200'], 1, 'Maths'),
  q('What is the square root of 144?', ['10', '11', '12', '14'], 2, 'Maths'),
  q('Which of these is a prime number?', ['21', '27', '29', '33'], 2, 'Maths'),
  q('Who wrote the Indian national anthem?', ['Bankim Chandra Chatterjee', 'Rabindranath Tagore', 'Sarojini Naidu', 'Subramania Bharati'], 1, 'General Knowledge'),
  q('What is the capital of India?', ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], 2, 'General Knowledge'),
  q('In which year did India gain independence?', ['1945', '1947', '1950', '1952'], 1, 'History'),
  q('Which language is used to style web pages?', ['HTML', 'CSS', 'SQL', 'Python'], 1, 'Computer Science'),
  q('What does CPU stand for?', ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Core Processing Utility'], 2, 'Computer Science'),
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (!(await User.findOne({ email: ADMIN_EMAIL }))) {
    await User.create({ name: 'Admin', email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 10), role: 'admin' });
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else console.log('Admin already exists');
  if ((await Question.countDocuments()) === 0) {
    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} sample questions`);
  } else console.log('Questions already exist, skipping');
  await mongoose.disconnect();
})();
