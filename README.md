# 🎬 VidBrain — AI YouTube Video Summarizer

A production-grade full-stack MERN application that uses **Claude AI** to analyze YouTube videos and generate summaries, bullet points, key concepts, and interactive MCQ quizzes.

---

## 🏗️ Tech Stack

| Layer      | Technology                                    |
|------------|----------------------------------------------|
| Frontend   | React 18, React Router 6, Framer Motion       |
| Backend    | Node.js 20, Express 4, Morgan, Helmet         |
| Database   | MongoDB 7 (Atlas or Compass)                  |
| Auth       | JWT (access + refresh tokens) + bcrypt        |
| AI         | Anthropic Claude claude-sonnet-4                      |
| Deployment | Docker + Docker Compose + Nginx               |

---

## 📁 Project Structure

```
yt-summarizer/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection + events
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Profile, Password, Logout
│   │   └── videoController.js    # Analyze, History, Stats, CRUD, Favorite, Notes
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + adminOnly guards
│   │   ├── errorHandler.js       # Global error + 404 handlers
│   │   └── validation.js         # express-validator rules
│   ├── models/
│   │   ├── User.js               # Schema: bcrypt, refresh token, preferences
│   │   └── Video.js              # Schema: analysis, MCQs, concepts, tags, status
│   ├── routes/
│   │   ├── auth.js               # /api/auth/*
│   │   ├── videos.js             # /api/videos/*
│   │   └── admin.js              # /api/admin/health + /stats
│   ├── utils/
│   │   ├── aiAnalysis.js         # Claude AI integration + fallback
│   │   ├── youtube.js            # Transcript extraction + oEmbed metadata
│   │   ├── token.js              # JWT generate + verify helpers
│   │   └── logger.js             # Colorized console logger with timestamps
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                 # Express app + rate limiters + graceful shutdown
│
├── frontend/
│   ├── public/
│   │   ├── index.html            # Google Fonts: Syne + DM Sans + DM Mono
│   │   └── manifest.json         # PWA manifest
│   └── src/
│       ├── components/
│       │   ├── dashboard/
│       │   │   └── StatCard.js           # Reusable metric card with trend
│       │   ├── ui/
│       │   │   ├── CopyButton.js         # One-click clipboard copy
│       │   │   ├── EmptyState.js         # Reusable empty placeholder
│       │   │   ├── ErrorBoundary.js      # React error boundary
│       │   │   ├── Modal.js              # Accessible ESC-closable modal
│       │   │   ├── Navbar.js             # Sticky nav + mobile menu
│       │   │   ├── ProgressBar.js        # Animated progress bar
│       │   │   └── Skeleton.js           # Shimmer loaders (card, stat, detail)
│       │   └── video/
│       │       ├── ExportMenu.js         # Download as .md / .txt / .json
│       │       └── VideoCard.js          # Grid card with thumbnail, badges, actions
│       ├── context/
│       │   └── AuthContext.js    # Global auth state + JWT bootstrap
│       ├── hooks/
│       │   ├── useDebounce.js    # Debounce search input
│       │   ├── useLocalStorage.js # Persistent localStorage hook
│       │   └── useVideos.js      # Video list state + actions
│       ├── pages/
│       │   ├── LandingPage.js    # Public marketing page
│       │   ├── LoginPage.js      # Email/password login
│       │   ├── RegisterPage.js   # Signup with password strength
│       │   ├── DashboardPage.js  # Stats, difficulty breakdown, recent videos
│       │   ├── AnalyzePage.js    # URL input, length picker, progress steps
│       │   ├── HistoryPage.js    # Searchable grid with filters + pagination
│       │   ├── VideoDetailPage.js # 4-tab analysis: summary/bullets/concepts/quiz
│       │   ├── ProfilePage.js    # Update name, change password, logout
│       │   └── NotFoundPage.js   # Stylized 404 page
│       ├── services/
│       │   └── api.js            # Axios instance with interceptors
│       ├── App.js                # Router + ErrorBoundary + Toaster
│       ├── index.css             # Full CSS design system (vars, components, utils)
│       └── index.js
│
├── .gitignore
├── docker-compose.yml            # MongoDB + Backend + Frontend services
├── package.json                  # Root scripts: install:all, dev, build
└── README.md
```

---

## ⚡ Quick Start (Local Dev)

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or Atlas connection string)
- **Anthropic API key** → [console.anthropic.com](https://console.anthropic.com)

### 1 — Install dependencies

```bash
npm run install:all
# Installs both backend and frontend node_modules
```

### 2 — Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# ─── Database ───────────────────────────────────────
# Local MongoDB Compass:
MONGODB_URI=mongodb://localhost:27017/yt-summarizer

# MongoDB Atlas (production):
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/yt-summarizer

# ─── JWT ────────────────────────────────────────────
JWT_SECRET=super_secret_key_at_least_32_characters_long
JWT_REFRESH_SECRET=another_strong_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ─── AI ─────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...your-key...

# ─── Server ─────────────────────────────────────────
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3 — Start MongoDB (local)

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (PowerShell)
net start MongoDB
```

### 4 — Run the app

```bash
npm run dev
# Backend  → http://localhost:5000
# Frontend → http://localhost:3000
# Health   → http://localhost:5000/health
```

---

## 🐳 Docker Setup (One Command)

```bash
# 1. Set your API key in the environment
export ANTHROPIC_API_KEY=sk-ant-...your-key...

# 2. Build and start all services (MongoDB + Backend + Frontend)
docker-compose up --build

# App runs at:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:5000
#   MongoDB   → localhost:27017
```

To stop:
```bash
docker-compose down
# Remove volumes too:
docker-compose down -v
```

---

## 🔑 API Reference

### Auth — `/api/auth`

| Method | Endpoint           | Auth | Body                              | Description              |
|--------|--------------------|------|-----------------------------------|--------------------------|
| POST   | `/register`        | ✗    | `{name, email, password}`         | Create account           |
| POST   | `/login`           | ✗    | `{email, password}`               | Sign in → JWT token      |
| GET    | `/me`              | ✓    | —                                 | Current user profile     |
| PUT    | `/profile`         | ✓    | `{name, preferences}`             | Update profile           |
| PUT    | `/change-password` | ✓    | `{currentPassword, newPassword}`  | Change password          |
| POST   | `/logout`          | ✓    | —                                 | Invalidate refresh token |

### Videos — `/api/videos` (all protected)

| Method | Endpoint          | Query / Body                              | Description              |
|--------|-------------------|-------------------------------------------|--------------------------|
| POST   | `/analyze`        | `{url, summaryLength, forceRefresh}`      | Analyze a YouTube video  |
| GET    | `/history`        | `?page&limit&search&favorite&status`      | Paginated video history  |
| GET    | `/stats`          | —                                         | Dashboard statistics     |
| GET    | `/:id`            | —                                         | Full analysis for video  |
| PUT    | `/:id/favorite`   | —                                         | Toggle favorite          |
| PUT    | `/:id/notes`      | `{notes}`                                 | Save personal notes      |
| DELETE | `/:id`            | —                                         | Remove from history      |

### Admin — `/api/admin`

| Method | Endpoint  | Auth       | Description              |
|--------|-----------|------------|--------------------------|
| GET    | `/health` | ✗ (public) | Server + DB health check |
| GET    | `/stats`  | Admin only | User + video metrics     |

---

## 🗄️ MongoDB Schemas

### User
```javascript
{
  name: String,                        // 2–50 chars
  email: String,                       // unique, lowercase
  password: String,                    // bcrypt hashed, select:false
  role: 'user' | 'admin',
  totalVideosAnalyzed: Number,
  preferences: {
    defaultSummaryLength: 'brief' | 'medium' | 'detailed',
    theme: 'dark' | 'light',
  },
  isActive: Boolean,
  lastLogin: Date,
  refreshToken: String,                // select:false
  createdAt, updatedAt,
}
```

### Video
```javascript
{
  userId: ObjectId,                    // ref: User
  videoId: String,                     // YouTube video ID
  url: String,
  title, channelName, thumbnailUrl, duration,
  transcript: String,
  transcriptWordCount: Number,
  analysis: {
    summary: String,
    bulletPoints: [String],
    keyConcepts: [{ term, definition, importance: 'high'|'medium'|'low' }],
    mcqs: [{ question, options:[String], correctAnswer:Number, explanation }],
    sentiment: 'positive'|'neutral'|'negative'|'mixed',
    difficulty: 'beginner'|'intermediate'|'advanced',
    tags: [String],
    estimatedReadTime: Number,
  },
  status: 'pending'|'processing'|'completed'|'failed',
  isFavorite: Boolean,
  userNotes: String,
  processingTime: Number,              // ms
  createdAt, updatedAt,
}
```

---

## 🤖 AI Features (Claude claude-sonnet-4)

| Feature          | Details                                               |
|------------------|-------------------------------------------------------|
| **Summary**      | 150 / 300 / 500 words depending on chosen length     |
| **Bullet Points**| 5 / 8 / 12 key takeaways                            |
| **Key Concepts** | 5–8 terms with definitions + importance rating       |
| **MCQ Quiz**     | 5 questions, 4 options each, with explanations       |
| **Metadata**     | Sentiment, difficulty, 5 tags, estimated read time   |
| **Fallback**     | Graceful degradation if API key not configured       |

---

## 🎨 Design System

| Token         | Value                                  |
|---------------|----------------------------------------|
| Bg void       | `#05050a`                              |
| Bg surface    | `#111120`                              |
| Accent        | `#f59e0b` (electric amber)             |
| Text primary  | `#f0f0f8`                              |
| Display font  | Syne (800 weight headings)             |
| Body font     | DM Sans (400/500)                      |
| Mono font     | DM Mono (badges, code, numbers)        |

Full design system lives in `frontend/src/index.css` as CSS custom properties.

---

## 🚀 Deployment

### Backend → Railway / Render / Fly.io
```bash
# Set these environment variables in the platform dashboard:
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
ANTHROPIC_API_KEY=...
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend → Vercel / Netlify
```bash
# Build command:
npm run build

# Output directory:
build/

# Environment variable:
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### MongoDB → Atlas Free Tier
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist `0.0.0.0/0` (or your server IP)
4. Copy the connection string into `MONGODB_URI`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection failed` | Check `MONGODB_URI`, ensure `mongod` is running |
| `Transcript not available` | Video has disabled captions; try another video |
| `AI returns fallback message` | Set `ANTHROPIC_API_KEY` in `.env` and restart |
| `CORS errors in browser` | Set `FRONTEND_URL` in backend `.env` to match origin |
| `401 Unauthorized` | Token expired — log out and log back in |
| `Port 5000 already in use` | Change `PORT` in `.env` or kill the process |
| Docker: `mongo unhealthy` | Wait 30s for MongoDB to start, then `docker-compose restart backend` |

---

## 📝 Key Implementation Notes

- **Transcript extraction** uses `youtube-transcript` npm package. Requires English captions to be enabled on the video. Some channels disable transcript access.
- **Caching** — Previously analyzed videos are served instantly from MongoDB. Pass `forceRefresh: true` to re-run AI analysis.
- **Token truncation** — Transcripts longer than ~12,000 characters are trimmed before sending to Claude to stay within token limits while preserving quality.
- **Rate limiting** — Global: 200 req/15min. Auth: 20 req/15min. Analysis: 8 req/min per user.
- **Graceful shutdown** — SIGTERM and SIGINT handlers close MongoDB connection cleanly before exit.
- **Error boundary** — React ErrorBoundary catches unexpected component crashes and shows a recovery UI.

---

*Built with ❤️ — MERN Stack + Claude AI + Docker*
