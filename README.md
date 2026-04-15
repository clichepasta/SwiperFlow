# SwiperFlow

> A full-stack developer networking platform — swipe through developer profiles, send connection requests, and grow your professional network.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat-square&logo=tailwind-css)
![AWS](https://img.shields.io/badge/Deployed%20on-AWS%20EC2-FF9900?style=flat-square&logo=amazon-aws)
![Nginx](https://img.shields.io/badge/Reverse%20Proxy-Nginx-009639?style=flat-square&logo=nginx)

---

## Overview

SwiperFlow is a full-stack web application that allows developers to discover each other through a swipe-based interface, send connection requests, and manage their network — inspired by the UX pattern of swipe-based apps.

The project demonstrates **end-to-end ownership** of a production-grade feature set: a stateful Angular frontend, a RESTful Express API, MongoDB data modeling, stateless JWT authentication, and clean separation of concerns across both tiers. The application is **deployed on AWS EC2** with Nginx serving as a reverse proxy.

---

## Architecture

```
┌─────────────────────────────────┐      ┌──────────────────────────────────┐
│         Angular 21 SPA          │      │        Express 5 REST API         │
│                                 │      │                                  │
│  ┌──────────┐  ┌─────────────┐  │ HTTP │  ┌──────────┐  ┌─────────────┐  │
│  │  Features │  │    Core     │  │─────▶│  │  Routes  │  │ Middlewares │  │
│  │           │  │  Services   │  │      │  │          │  │    (JWT)    │  │
│  │  - feed   │  │  Auth Svc   │  │      │  │  auth    │  └─────────────┘  │
│  │  - auth   │  │  API Svc    │  │      │  │  profile │                   │
│  │  - profile│  │  Signals    │  │      │  │  requests│  ┌─────────────┐  │
│  │  - requests  │  Interceptor│  │      │  │  user    │  │   Mongoose  │  │
│  │  - connect│  └─────────────┘  │      │  └──────────┘  │   Models    │  │
│  └──────────┘                   │      │                 └─────────────┘  │
└─────────────────────────────────┘      └──────────────────┬───────────────┘
                                                            │
                                                  ┌─────────▼────────┐
                                                  │     MongoDB       │
                                                  │  User collection  │
                                                  │  ConnectionRequest│
                                                  └──────────────────┘
```

**Key architectural decisions:**

- **Stateless auth** via JWT stored in HTTP cookies — server is fully stateless between requests; no sessions.
- **Smart feed algorithm** — the `/user/feed` query excludes users the current user has already interacted with (sent, received, ignored) using a compound `$nin` filter, avoiding redundant profiles.
- **Compound index** on `ConnectionRequest { fromUserId, toUserId }` for fast duplicate-request lookups at the DB level.
- **Pre-save Mongoose hook** enforces self-request prevention at the model layer — a second line of defence beyond the route handler.
- **Angular Signals** for reactive auth state — lightweight, no NgRx overhead for this scope.
- **Functional HTTP interceptor** (Angular 17+ style) auto-redirects to login on any 401, globally.
- **Nginx as reverse proxy** in production — handles SSL termination and routes all traffic to the Node.js process, keeping port 7000 unexposed to the public internet.

---

## Feature Breakdown

| Feature | Description |
|---|---|
| **Auth** | Signup with strong-password enforcement (`validator.isStrongPassword`), bcrypt hashing (10 rounds), JWT in cookie with 1h expiry |
| **Feed** | Paginated discovery feed (configurable page/limit, max 50/page) filtered to exclude self, connections, and prior interactions |
| **Swipe / Requests** | Send `interested` or `ignore` swipes; duplicate prevention enforced at route + DB + model layers |
| **Review** | Accept or reject incoming `interested` requests; authorization check ensures only the recipient can act |
| **Connections** | View all accepted connections with populated profile data |
| **Profile** | View and edit profile; field-level allowlist validation on PATCH to block unauthorized field updates |
| **Route Guards** | Angular `authGuard` protects all authenticated routes; global HTTP interceptor handles 401s |

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Frontend framework | Angular 21 | Component architecture, DI, standalone components |
| State management | Angular Signals | Built-in reactive primitives, no extra dependencies |
| Styling | TailwindCSS 3 | Utility-first, consistent design system |
| Backend framework | Express 5 | Minimal, composable, async-native |
| Database | MongoDB + Mongoose 9 | Document model fits flexible user profiles |
| Auth | JWT + bcrypt | Stateless, horizontally scalable |
| Validation | `validator` library | Battle-tested email and password rules |
| Dev experience | nodemon, Prettier, Vitest | Fast feedback loop |

---

## Project Structure

```
SwiperFlow/
├── client/                          # Angular 21 SPA
│   └── src/app/
│       ├── core/
│       │   ├── guards/              # authGuard — protects authenticated routes
│       │   ├── interceptors/        # apiInterceptor — global 401 → redirect
│       │   └── services/            # AuthService (Signals), ApiService
│       ├── features/
│       │   ├── auth/                # Login, Signup components
│       │   ├── feed/                # Discovery feed with swipe actions
│       │   ├── profile/             # View & edit profile
│       │   ├── requests/            # Incoming connection requests
│       │   └── connections/         # Accepted connections list
│       └── shared/                  # Reusable components & utilities
│
└── server/                          # Express 5 REST API
    └── src/
        ├── config/                  # MongoDB connection (Mongoose)
        ├── middlewares/             # adminAuth — JWT verification middleware
        ├── models/
        │   ├── user.js              # User schema + instance methods (getJwtToken, passwordValidate)
        │   └── connectionRequest.js # Compound index + pre-save self-request guard
        ├── routes/
        │   ├── auth.js              # POST /signup, /login, /logout
        │   ├── profile.js           # GET /profile, PATCH /profile/edit, /profile/password
        │   ├── requests.js          # POST /request/send/:status/:toUserId, /request/review/:status/:requestId
        │   └── user.js              # GET /user/feed, /user/connections, /user/request/received
        └── utils/
            └── validation.js        # Signup + profile edit field validators
```

---

## API Reference

All authenticated routes require a valid `token` cookie issued at login.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register; validates email format + password strength |
| `POST` | `/login` | — | Returns JWT cookie on success |
| `POST` | `/logout` | — | Expires the cookie immediately |

### Profile

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` | ✅ | Returns authenticated user's full document |
| `PATCH` | `/profile/edit` | ✅ | Updates allowlisted fields (firstName, lastName, age, gender, about, skills) |
| `PATCH` | `/profile/password` | ✅ | Updates password (re-hashed via Mongoose pre-save) |

### Connection Requests

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/request/send/interested/:toUserId` | ✅ | Express interest in another user |
| `POST` | `/request/send/ignore/:toUserId` | ✅ | Dismiss a profile |
| `POST` | `/request/review/accepted/:requestId` | ✅ | Accept an incoming request |
| `POST` | `/request/review/rejected/:requestId` | ✅ | Reject an incoming request |

### Feed & Network

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/user/feed?page=1&limit=10` | ✅ | Paginated feed, excludes interacted profiles |
| `GET` | `/user/request/received` | ✅ | Pending incoming `interested` requests |
| `GET` | `/user/connections` | ✅ | All accepted connections (both directions) |

---

## Data Models

### User

```
firstName    String   required, 4–50 chars
lastName     String
emailId      String   required, unique, lowercased, validated
password     String   required, strong password enforced
age          Number   min 18
gender       String   enum: male | female | others
about        String   default: "No bio"
skills       [String]
createdAt    Date     auto
updatedAt    Date     auto
```

### ConnectionRequest

```
fromUserId   ObjectId → User   required
toUserId     ObjectId → User   required
status       String            enum: ignore | interested | accepted | rejected
createdAt    Date              auto
updatedAt    Date              auto

Index: { fromUserId: 1, toUserId: 1 }   ← compound index for O(log n) duplicate checks
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 10
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Clone
git clone https://github.com/clichepasta/SwiperFlow.git
cd SwiperFlow

# 2. Environment — create server/.env
MONGO_URI=mongodb://localhost:27017/swiperflow

# 3. Install
cd server && npm install
cd ../client && npm install

# 4. Run (from project root)
npm run dev:server   # API on :7000
npm run dev:client   # SPA on :4200
```

Open **http://13.127.137.155/auth/login**

---

## Deployment

The application is hosted on **AWS EC2** (Ubuntu) with **Nginx** acting as a reverse proxy in front of the Node.js API.

```
┌──────────────┐       ┌───────────────────────────────────────────┐
│   Internet   │──────▶│              AWS EC2 Instance              │
└──────────────┘  :80  │                                           │
                       │   ┌─────────────┐      ┌──────────────┐  │
                       │   │    Nginx     │─────▶│  Node.js API  │ │
                       │   │ Reverse Proxy│ :7000│  (Express 5) │  │
                       │   └─────────────┘      └──────────────┘  │
                       │                                           │
                       │   Static Angular build served by Nginx    │
                       └───────────────────────────────────────────┘
```

**Infrastructure summary:**

| Layer | Technology | Role |
|---|---|---|
| Cloud | AWS EC2 (Ubuntu) | Hosts both frontend and backend |
| Reverse proxy | Nginx | Routes `/api` traffic to Node.js on port 7000; serves Angular static build for all other routes |
| Process management | (Node.js direct / PM2-ready) | Keeps the API process alive |
| Database | MongoDB | Runs on the same instance or Atlas |

**Nginx config pattern used:**

```nginx
server {
    listen 80;

    # Serve Angular SPA
    location / {
        root /var/www/swiperflow;\n        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:7000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Author

**Rahul Patnaik** — [github.com/clichepasta](https://github.com/clichepasta)
