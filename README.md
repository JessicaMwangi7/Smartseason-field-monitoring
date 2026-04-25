🌿 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

🚀 Demo Credentials
Role	Email	Password
Admin	admin@smartseason.com
	admin123
Field Agent	james@smartseason.com
	agent123
Field Agent	amina@smartseason.com
	agent123

🛠 Tech Stack
Backend: Node.js, Express.js
Database: SQLite (better-sqlite3)
Auth: JWT, bcrypt

Frontend: React 18, React Router
HTTP Client: Axios
Styling: Custom CSS (no UI framework)

SQLite was used for simplicity and portability. Can be swapped with PostgreSQL/MySQL.

📁 Project Structure
smartseason/
├── backend/   → Express API, auth, database, seed data
└── frontend/  → React app (admin + agent dashboards)

⚙️ Setup Instructions
1. Clone Repo
git clone <repo-url>
cd smartseason

2. Backend
cd backend
npm install
node src/seed.js
npm run dev

Runs on: http://localhost:5000

3. Frontend
cd frontend
npm install
npm start

Runs on: http://localhost:3000

🔐 Key Features
Role-based access (Admin & Field Agents)
JWT authentication system
Field tracking (stage, notes, status)
Dynamic “At Risk” logic based on crop timelines
Admin dashboard for full field management
Agent dashboard for assigned fields only

🧠 Design Decisions
Computed field status (not stored) to avoid stale data
Role-based API protection (server-enforced)
Single PATCH endpoint with role-aware updates
SQLite chosen for zero setup complexity
Custom CSS UI to demonstrate frontend control

🌱 Field Status Logic

Fields are automatically classified as:

Active
At Risk
Completed

Based on crop stage + time since planting.

📌 Assumptions
One field → one agent
Only admins can create/delete fields
Agents can only update assigned fields
App runs locally (no deployment config included)

🚀 Future Improvements
Email alerts for “At Risk” fields
Map-based field tracking (Leaflet)
File/photo uploads for field reports
Export reports (CSV/PDF)

⭐ Summary

SmartSeason demonstrates:

Full-stack CRUD architecture
Secure authentication system
Role-based backend design
Real-world agricultural workflow modeling