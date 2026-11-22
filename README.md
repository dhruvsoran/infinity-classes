# ∞ Infinity Classes

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A mini online test platform built with the MERN stack. Students take timed 10-question tests, see exactly which answers they got right or wrong, and stay motivated with XP, levels, streaks, badges and a leaderboard.

## Features

**Core**
- **Sign up and log in** with email and password (bcrypt-hashed passwords, JWT sessions)
- **Test screen** with 10 random multiple-choice questions loaded from MongoDB
- **10-minute countdown** that auto-submits when time runs out
- **Result page** with the score, right and wrong answers, and the correct answer for every question
- **History** of all past attempts with scores and dates, each linking back to its full review
- **Admin page** to add and delete questions (admin accounts only)

**Gamification**
- **XP and levels**: earn XP for every test and climb from Beginner to Legend
- **Daily streak**: practise on consecutive days to keep the flame going
- **7 badges** to unlock, from First Step to Perfect 10
- **Leaderboard** showing the top 5 students by XP
- **Celebration** with confetti for scores of 80% and above

### How XP works

| Action | XP |
|---|---|
| Finish a test | +5 |
| Each correct answer | +10 |
| Perfect score (10/10) | +20 bonus |
| Score 7+ in under 5 minutes | +10 bonus |

Every 100 XP is one level: Beginner, Explorer, Scholar, Achiever, Champion, Legend.

### Badges

| Badge | How to earn it |
|---|---|
| 🚀 First Step | Finish your first test |
| 📚 Consistent | Finish 5 tests |
| 🎯 Sharp Mind | Score 80% or more in 3 tests |
| 🏆 Perfect 10 | Get every answer right |
| ⚡ Speedster | Score 7+ in under 5 minutes |
| 🔥 On Fire | Practise 3 days in a row |
| 🎓 Scholar | Reach Level 3 |

XP, levels, streaks and badges are calculated from the saved attempts, so there are no extra database fields to maintain.

## Tech stack

| Layer | Tools |
|---|---|
| Database | MongoDB Atlas, Mongoose |
| Backend | Node.js, Express, JSON Web Tokens, bcryptjs |
| Frontend | React 18, React Router 6, Vite |
| Styling | Plain CSS with design tokens, Plus Jakarta Sans |

## Getting started

### Prerequisites
- Node.js 18 or newer
- A MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works well)

### 1. Clone and configure

```bash
git clone https://github.com/<your-username>/infinity-classes.git
cd infinity-classes/server
cp .env.example .env
```

Open `server/.env` and fill in your values:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string, including a database name |
| `JWT_SECRET` | A long random string used to sign login tokens |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Optional. Your frontend URL, to restrict CORS in production |

In Atlas, add your IP address under **Network Access** or the server will not connect.

### 2. Start the API

```bash
cd server
npm install
npm run seed     # creates the admin account and 12 sample questions (run once)
npm start        # http://localhost:5000
```

### 3. Start the frontend

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no extra setup is needed.

### Default admin account

Created by `npm run seed`:

```
Email:    admin@infinityclasses.com
Password: Admin@123
```

Change this password (in `server/seed.js` before seeding, or directly in the database) before deploying anywhere public.

## Project structure

```
infinity-classes/
├── server/
│   ├── index.js              # Express app and MongoDB connection
│   ├── seed.js               # Admin user and sample questions
│   ├── models/               # User, Question, Attempt
│   ├── routes/               # auth, questions (admin), attempts
│   ├── middleware/auth.js    # JWT and admin role checks
│   └── utils/gamify.js       # XP, levels, streaks, badges
└── client/
    └── src/
        ├── pages/            # AuthPage, Dashboard, Test, Result, History, Admin
        ├── components/       # Navbar, Logo
        ├── api.js            # Fetch wrapper
        ├── auth.jsx          # Auth context
        └── styles.css
```

## API reference

All routes except sign up and log in need an `Authorization: Bearer <token>` header.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create a student account |
| POST | `/api/auth/login` | Public | Log in and receive a token |
| GET | `/api/auth/me` | Student | Current user |
| POST | `/api/attempts/start` | Student | Start a test, or resume a running one |
| POST | `/api/attempts/:id/submit` | Student | Submit answers and get graded |
| GET | `/api/attempts` | Student | Attempt history |
| GET | `/api/attempts/stats` | Student | XP, level, streak, badges, leaderboard |
| GET | `/api/attempts/:id` | Student | Full result with correct answers |
| GET | `/api/questions` | Admin | List all questions |
| POST | `/api/questions` | Admin | Add a question |
| DELETE | `/api/questions/:id` | Admin | Delete a question |

## Design decisions

- **Answers stay on the server.** The correct answer is never sent to the browser while a test is running, and grading happens server-side, so scores cannot be tampered with.
- **The server owns the clock.** The start time is stored when the test begins. The timer counts down to a server-provided end time, so refreshing the page does not reset it, and the server rejects answers that arrive well after time is up.
- **Resume support.** If a student closes the tab mid-test, `start` returns the same test with the remaining time. An expired test is graded automatically.
- **Derived gamification.** Stats are computed from saved attempts, which keeps the data model small and makes old attempts count towards XP automatically.

## Deployment

1. **Database:** MongoDB Atlas. Allow your host's IP, or `0.0.0.0/0` for a quick demo.
2. **API:** deploy `server/` to a Node host such as Render or Railway. Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL`, with start command `npm start`.
3. **Frontend:** deploy `client/` to Vercel or Netlify with build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to your API's URL, and add a rewrite of all routes to `index.html` so React Router works on refresh.

## Security notes

- Never commit `.env`. It is already in `.gitignore`.
- If a database password is ever exposed, rotate it in Atlas straight away.
- Use a long random `JWT_SECRET` in production.

## Roadmap ideas

- Choose a subject or difficulty before starting a test
- Weekly leaderboard reset
- Bulk question import from CSV
- Per-subject performance charts

## License

Released under the [MIT License](LICENSE).
