# 🌿 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

---

## Demo Credentials

| Role        | Email                      | Password   |
|-------------|----------------------------|------------|
| Admin       | admin@smartseason.com      | admin123   |
| Field Agent | james@smartseason.com      | agent123   |
| Field Agent | amina@smartseason.com      | agent123   |

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js + Express.js                |
| Database  | SQLite (via `better-sqlite3`)       |
| Auth      | JWT (JSON Web Tokens) + bcryptjs    |
| Frontend  | React 18 + React Router v6          |
| HTTP      | Axios                               |
| Fonts     | DM Sans + DM Mono (Google Fonts)    |

SQLite was chosen for simplicity — no database server to set up. The schema and data layer are structured to be easily swapped for PostgreSQL or MySQL by replacing the `better-sqlite3` driver.

---

## Project Structure

```
smartseason/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, register, /me
│   │   │   ├── fieldsController.js   # Field CRUD + updates
│   │   │   └── usersController.js    # Agent management
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verify, role guards
│   │   ├── models/
│   │   │   ├── db.js                 # SQLite schema + connection
│   │   │   └── fieldStatus.js        # Status computation logic
│   │   ├── routes/
│   │   │   └── index.js              # All API routes
│   │   ├── index.js                  # Express app entry
│   │   └── seed.js                   # Demo data seeder
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── shared/
    │   │       ├── FieldCard.jsx     # Reusable field preview card
    │   │       ├── Layout.jsx        # Navbar + page wrapper
    │   │       └── StatsCard.jsx     # Dashboard stat widget
    │   ├── contexts/
    │   │   └── AuthContext.jsx       # Global auth state
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminFields.jsx
    │   │   │   └── AdminAgents.jsx
    │   │   ├── agent/
    │   │   │   ├── AgentDashboard.jsx
    │   │   │   └── AgentFields.jsx
    │   │   ├── FieldDetail.jsx       # Shared detail + update form
    │   │   └── Login.jsx
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── login.css
    │   │   ├── components.css
    │   │   └── dashboard.css
    │   ├── utils/
    │   │   └── api.js                # Axios instance with JWT interceptor
    │   ├── App.jsx                   # Router + protected routes
    │   └── index.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- npm v9+

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smartseason
```

### 2. Set up the Backend
```bash
cd backend
npm install
node src/seed.js     # Creates database + demo data
npm run dev          # Starts on http://localhost:5000
```

You should see:
```
🌱 SmartSeason API running on http://localhost:5000
```

### 3. Set up the Frontend (new terminal tab)
```bash
cd frontend
npm install
npm start            # Starts on http://localhost:3000
```

The frontend proxies `/api` requests to `localhost:5000` automatically (configured in `package.json`).

### 4. Open in browser
Visit **http://localhost:3000** and log in with the demo credentials above.

---

## API Endpoints

### Auth
| Method | Endpoint         | Access | Description              |
|--------|------------------|--------|--------------------------|
| POST   | /api/auth/login  | Public | Returns JWT token        |
| POST   | /api/auth/register | Public | Create account         |
| GET    | /api/auth/me     | Any    | Current user info        |

### Fields
| Method | Endpoint              | Access       | Description                      |
|--------|-----------------------|--------------|----------------------------------|
| GET    | /api/fields           | Any (auth)   | Admin: all; Agent: assigned only |
| POST   | /api/fields           | Admin        | Create a field                   |
| GET    | /api/fields/:id       | Any (auth)   | Field detail + update history    |
| PATCH  | /api/fields/:id       | Any (auth)   | Admin: full edit; Agent: stage+note |
| DELETE | /api/fields/:id       | Admin        | Delete a field                   |

### Users
| Method | Endpoint          | Access | Description        |
|--------|-------------------|--------|--------------------|
| GET    | /api/users        | Admin  | All users          |
| GET    | /api/users/agents | Admin  | Agents only        |
| POST   | /api/users        | Admin  | Create agent       |
| DELETE | /api/users/:id    | Admin  | Remove user        |

---

## Field Status Logic

Status is **computed dynamically** from a field's stage and planting date — it is not stored in the database. This avoids stale data and ensures status is always accurate.

### Rules

```
stage === 'Harvested'
  → Status: Completed

stage === 'Planted'  AND  days_since_planting > planted_window
  → Status: At Risk

stage === 'Growing'  AND  days_since_planting > (planted + growing)_window
  → Status: At Risk

stage === 'Ready'    AND  days_since_planting > full expected window
  → Status: At Risk

Otherwise
  → Status: Active
```

### Expected Duration Windows (by crop type)

| Crop    | Planted (days) | Growing (days) | Ready (days) |
|---------|----------------|----------------|--------------|
| Maize   | 14             | 75             | 21           |
| Wheat   | 10             | 60             | 14           |
| Rice    | 21             | 100            | 21           |
| Sorghum | 14             | 70             | 21           |
| Beans   | 10             | 50             | 14           |
| Default | 14             | 75             | 21           |

These windows reflect realistic agronomy timelines. If a field is still in the "Planted" stage after 14+ days, something may be wrong — it flags as **At Risk** so coordinators can investigate.

See `backend/src/models/fieldStatus.js` for the implementation.

---

## Design Decisions

### 1. SQLite over PostgreSQL
For a self-contained assessment submission, SQLite eliminates the need for database server setup. The abstraction layer (`db.js`) makes it straightforward to swap drivers.

### 2. Computed status (not stored)
Field status is never persisted — it's always recalculated from the planting date + stage. This means no background jobs, no stale data, and no sync issues.

### 3. Role-based access at the API level
Roles are enforced in middleware (`requireAdmin`). Agents cannot access or modify fields they are not assigned to — enforced server-side, not just hidden in the UI.

### 4. Single `PATCH /fields/:id` endpoint with role-aware behavior
Rather than separate admin/agent update endpoints, the same route inspects `req.user.role` and applies different update permissions. Agents can only change `stage` and add `note`; admins can change anything.

### 5. React with no UI framework
Styled from scratch with CSS variables and custom components — demonstrates CSS ability and avoids opinionated component library lock-in.

---

## Assumptions Made

- A field can only be assigned to one agent at a time.
- Agents cannot create or delete fields — only admins can.
- The "At Risk" flag is based on time elapsed in a stage, not on explicit agent-reported problems (though notes can communicate issues).
- The app runs locally; no production deployment config is included (but is straightforward to add with environment variables).
- Passwords are hashed with bcrypt (cost factor 10) — suitable for a demo but should use environment-configured secrets in production.

---

## If I Had More Time

- **Email notifications** when a field turns "At Risk"
- **Photo uploads** per field update (agents photograph crops)
- **Map view** using Leaflet with field GPS coordinates
- **Export to CSV/PDF** for seasonal reports
- **PostgreSQL migration** with proper connection pooling
