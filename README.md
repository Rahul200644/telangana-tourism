# 🏛️ Telangana Tourism - Full Stack App

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI GPT-4o-mini
- **Maps**: OpenStreetMap + Leaflet.js (free, no key needed)
- **Auth**: JWT + bcrypt

---

## 📁 Project Structure
```
telangana-tourism/
├── server.js              ← Main Express server
├── package.json           ← Dependencies
├── .env.example           ← Copy to .env and fill keys
├── data/
│   └── db.js              ← SQLite database + seeding
├── routes/
│   ├── auth.js            ← Login, Register APIs
│   ├── districts.js       ← District & places APIs
│   └── ai.js              ← OpenAI chat & itinerary APIs
└── public/
    └── index.html         ← Complete Frontend
```

---

## 🚀 Setup Instructions

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Open project in VS Code
```
File → Open Folder → select "telangana-tourism" folder
```

### Step 3 — Install dependencies
Open terminal in VS Code (Ctrl+`) and run:
```bash
npm install
```

### Step 4 — Set up API Keys
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env        # Windows
   cp .env.example .env          # Mac/Linux
   ```

2. Open `.env` and fill in your keys:
   ```
   OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
   GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_HERE
   ```

### Step 5 — Get API Keys

**OpenAI API Key (for AI Chat & Itinerary):**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and paste into .env

**Google Maps API Key (optional, for enhanced maps):**
1. Go to https://console.cloud.google.com
2. Create project → Enable "Maps JavaScript API"
3. Create credentials → API Key
4. Copy into .env

> ℹ️ The app works without Google Maps key using OpenStreetMap (free)

### Step 6 — Start the server
```bash
npm start
```
OR for auto-restart on file changes:
```bash
npm run dev
```

### Step 7 — Open in browser
```
http://localhost:3000
```

---

## 🔑 Default Login Credentials
| Username | Password | Role |
|----------|----------|------|
| admin | telangana123 | Admin |
| tourist | pass123 | User |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/districts | All 33 districts |
| GET | /api/districts/:id | District + tourist places |
| POST | /api/ai/chat | AI travel assistant chat |
| POST | /api/ai/itinerary | Generate AI trip plan |
| GET | /api/ai/plans | User's saved plans |
| GET | /api/health | Server health check |

---

## ✨ Features
- 🔐 Login / Register with JWT auth
- 🏛️ Charminar background on login page
- 🗺️ All 33 Telangana districts with tourist places
- 🤖 AI Travel Assistant (OpenAI GPT)
- 📋 AI Itinerary Generator (saved to database)
- 🗺️ Interactive route maps (Leaflet + OpenStreetMap)
- 💾 Saved trip plans per user
- 📱 Fully responsive design
- ✨ Animations and particle effects

---

## 🛠️ Troubleshooting

**"Cannot connect to server"** → Make sure `npm start` is running

**"OpenAI error"** → Check your OPENAI_API_KEY in .env

**"Module not found"** → Run `npm install` again

**Port already in use** → Change PORT in .env to 3001
