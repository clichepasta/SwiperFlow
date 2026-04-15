# SwiperFlow

A full-stack developer networking app — think Tinder, but for connecting with other developers. Browse profiles, send/receive connection requests, and manage your developer network.

Built with **Angular 21** on the frontend and **Node.js + Express** on the backend, backed by **MongoDB**.

---

## Features

- 🔐 **Authentication** — Secure signup/login with bcrypt password hashing and JWT-based session management via HTTP-only cookies
- 🃏 **Feed** — Paginated discovery feed showing developer profiles you haven't connected with yet
- 💌 **Connection Requests** — Send `interested` or `ignore` swipes; accept or reject incoming requests
- 👥 **Connections** — View your list of accepted connections
- 🙍 **Profile** — View and edit your developer profile (name, age, gender, bio, skills)
- 🛡️ **Route Guards** — Auth-protected Angular routes redirect unauthenticated users to login

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Angular 21, TailwindCSS 3, TypeScript 5 |
| Backend   | Node.js, Express 5                      |
| Database  | MongoDB, Mongoose 9                     |
| Auth      | JWT (`jsonwebtoken`), bcrypt            |
| Dev Tools | nodemon, Prettier, Vitest               |

---

## Project Structure

```
SwiperFlow/
├── client/                  # Angular frontend
│   └── src/
│       └── app/
│           ├── core/        # Guards, interceptors, services
│           ├── features/    # Page-level feature modules
│           │   ├── auth/        # Login & Signup
│           │   ├── feed/        # Discovery feed
│           │   ├── profile/     # User profile
│           │   ├── requests/    # Incoming requests
│           │   └── connections/ # Accepted connections
│           └── shared/      # Shared components & utilities
└── server/                  # Express backend
    └── src/
        ├── config/          # Database connection
        ├── middlewares/     # JWT auth middleware
        ├── models/          # Mongoose schemas (User, ConnectionRequest)
        ├── routes/          # Route handlers (auth, profile, requests, user)
        └── utils/           # Validation helpers
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 10
- A running MongoDB instance (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/clichepasta/SwiperFlow.git
cd SwiperFlow
```

### 2. Configure the server

Create a `.env` file inside the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/swiperflow
JWT_SECRET=your_jwt_secret
```

> **Note:** The server currently defaults to port **7000**. The Angular client expects the API at `http://localhost:7000`.

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run in development

From the project root you can use the convenience scripts:

```bash
# Start the backend (with hot-reload via nodemon)
npm run dev:server

# Start the frontend (Angular dev server on :4200)
npm run dev:client
```

Or start them individually:

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm start
```

Open **http://localhost:4200** in your browser.

---

## API Overview

All endpoints are prefixed relative to `http://localhost:7000`.  
Protected routes require a valid `token` cookie (issued on login).

### Auth

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| POST   | `/signup`  | Register a new user      |
| POST   | `/login`   | Login and receive cookie |
| POST   | `/logout`  | Clear the session cookie |

### Profile

| Method | Endpoint        | Auth | Description           |
|--------|-----------------|------|-----------------------|
| GET    | `/profile/view` | ✅   | Get own profile       |
| PATCH  | `/profile/edit` | ✅   | Update profile fields |

### Connection Requests

| Method | Endpoint                              | Auth | Description                      |
|--------|---------------------------------------|------|----------------------------------|
| POST   | `/request/send/:status/:toUserId`     | ✅   | Send `interested` or `ignore`    |
| POST   | `/request/review/:status/:requestId`  | ✅   | `accepted` or `rejected` a request |

### User / Feed

| Method | Endpoint                   | Auth | Description                          |
|--------|----------------------------|------|--------------------------------------|
| GET    | `/user/feed`               | ✅   | Paginated feed (excludes connections)|
| GET    | `/user/request/received`   | ✅   | Incoming pending requests            |
| GET    | `/user/connections`        | ✅   | Accepted connections list            |

---

## User Schema

| Field       | Type     | Notes                            |
|-------------|----------|----------------------------------|
| `firstName` | String   | Required, 4–50 chars             |
| `lastName`  | String   | Optional                         |
| `emailId`   | String   | Required, unique, validated      |
| `password`  | String   | Required, strong password enforced |
| `age`       | Number   | Min 18                           |
| `gender`    | String   | `male` / `female` / `others`    |
| `about`     | String   | Bio, defaults to `"No bio"`     |
| `skills`    | [String] | List of skills                   |

---

## License

ISC © [Rahul Patnaik](https://github.com/clichepasta)
