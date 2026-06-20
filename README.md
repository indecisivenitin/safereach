# 🛡️ SafeReach — Women Safety App

A real-time women safety platform where distressed women can send SOS alerts with their live location to nearby registered volunteers. Volunteers receive instant notifications, can accept requests, and navigate to the woman's location. Built with the MERN stack + Socket.io.

---

## ✨ Features

- **One-tap SOS** with optional text message
- **Real-time geolocation** sent with every alert
- **Nearest volunteer matching** using MongoDB `$nearSphere` geo queries
- **Live map tracking** (Leaflet.js + OpenStreetMap — 100% free)
- **Socket.io** for instant bidirectional communication
- **Volunteer accept/decline** with automatic fallback to next nearest
- **Review system** after help is received
- **JWT authentication** with role-based access (woman / volunteer)
- **Push notification support** via Firebase Cloud Messaging
- **PWA-ready** — installable on mobile home screen

---

## 🗂️ Project Structure

```
safereach/
├── server/                 # Node.js + Express + Socket.io backend
│   ├── config/             # DB, Firebase config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── socket/             # Socket.io event handlers
│   ├── utils/              # Helpers
│   └── index.js            # Entry point
│
└── client/                 # React (Vite) frontend
    └── src/
        ├── components/     # Reusable UI components
        ├── context/        # React context (Auth, Socket, Alert)
        ├── hooks/          # Custom hooks
        ├── pages/          # Route pages
        └── services/       # Axios API calls
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Firebase project (for push notifications — optional for hackathon)

### 1. Clone & Install

```bash
git clone <repo-url>
cd safereach

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Environment Variables

**server/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/safereach
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_KEY=./config/firebase-service-account.json
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App runs at `http://localhost:5173`

---

## 🧪 Test Accounts (seed data)

After running `cd server && npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Woman | priya@test.com | Test@1234 |
| Volunteer | rahul@test.com | Test@1234 |
| Volunteer | amit@test.com | Test@1234 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Maps | Leaflet.js + OpenStreetMap (free) |
| Real-time | Socket.io |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Push Notifications | Firebase Cloud Messaging |
| State | React Context + useReducer |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/alerts | Create SOS alert |
| GET | /api/alerts/my | Get user's alerts |
| PUT | /api/alerts/:id/accept | Volunteer accepts |
| PUT | /api/alerts/:id/resolve | Mark help received |
| GET | /api/alerts/nearby | Get nearby active alerts (volunteer) |

### Volunteers
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | /api/volunteers/location | Update live location |
| PATCH | /api/volunteers/status | Toggle active/inactive |
| GET | /api/volunteers/stats | Get volunteer stats |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews | Submit review |
| GET | /api/reviews/volunteer/:id | Get volunteer reviews |
