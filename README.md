🌿 SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

🚀 Quick Start
Prerequisites
Node.js (v18+)
npm (v9+)


Installation
1. Clone the repository
git clone <repo-url>
cd smartseason


2. Backend Setup
cd backend
npm install
node src/seed.js   # Initialize database with demo data
npm run dev

Backend runs on:

http://localhost:5000


3. Frontend Setup
cd frontend
npm install
npm start

Frontend runs on:

http://localhost:3000


🔐 Demo Credentials

Role	Email	Password
Admin	admin@smartseason.com
	admin123
Field Agent	james@smartseason.com
	agent123
Field Agent	amina@smartseason.com
	agent123


🏗 Architecture

Frontend (React)
React 18
React Router
Axios
Custom CSS (no UI library)
Context API for state management


Backend (Node.js)
Express.js
SQLite (better-sqlite3)
JWT Authentication
bcrypt for password hashing


🌱 Core Features
Role-based access control (Admin & Field Agents)
Secure authentication with JWT
Field tracking (stage, notes, updates)
Dynamic field status (Active / At Risk / Completed)
Admin dashboard for full management
Agent dashboard for assigned fields only


🧠 Design Decisions
SQLite database for zero setup complexity
Computed field status (always recalculated, never stored)
Role-based API security enforced in middleware
Single update endpoint with role-aware permissions
Custom CSS UI for full control and flexibility


📁 Project Structure
smartseason/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── contexts/
        ├── styles/
        └── utils/


📌 Assumptions

Each field is assigned to one agent
Only admins can create or delete fields
Agents can only update assigned fields
Application runs locally (no production deployment included)


🚀 Future Improvements
Email notifications for “At Risk” fields
Map-based field visualization (Leaflet integration)
Photo uploads for field reports
Export reports (CSV/PDF)


⭐ Summary

SmartSeason demonstrates:

Full-stack CRUD architecture
Secure JWT authentication system
Role-based backend design
Real-world agricultural workflow modeling
Clean separation of frontend and backend concerns

🔥 End Result

A functional, scalable field monitoring system designed to simulate real-world agricultural operations with modern web technologies.