# 🚀 ProjectFlow | Premium Enterprise SaaS

ProjectFlow is a state-of-the-art, high-fidelity project management and administrative oversight platform engineered for modern enterprise teams. Featuring an elite VIP Gold & Charcoal aesthetic, ProjectFlow seamlessly bridges the gap between high-level executive oversight, portfolio management, and granular team execution through a sophisticated dual-governance workflow.

---

## 💎 Premium UI & Brand Identity

ProjectFlow features an elite brand identity tailored for executive command centers:
- **VIP Gold & Charcoal Aesthetic**: A luxurious, high-contrast palette combining rich gold gradients (`#f59e0b` / `#fbbf24`) with soft, sophisticated charcoal slate (`#1e293b`).
- **Concentric Architectural Branding**: Powered by the clean, professional `Layers` icon symbolizing multi-tier enterprise architecture and structured project flow across the navigation bar and browser tab favicon.
- **Glassmorphic Bento Grids**: Modern, asymmetric UI layouts offering instant visual hierarchy for executive metrics, system activity, and user profiles.

---

## ✨ Key Features & Architectural Innovations

### 1. Role-Based Command Centers
Dedicated, high-fidelity portals tailored to specific organizational tiers:
- **Executive Oversight (Admin)**: Focused on macro-level project monitoring, administrative directives, and organizational health.
- **Portfolio Management (Manager)**: Focused on project creation, team assignment, task generation, and proposal governance.
- **General Access (Member)**: Focused on deliverable execution, real-time Kanban updates, and progress logging.

### 2. Admin Directive Dispatch System
Admins can directly communicate top-down priority shifts, scope changes, or urgent instructions to specific team members or entire project teams. Directives are instantly pushed to the user's real-time **Notification Center**.

### 3. Admin-Manager Dual-Governance Workflow
To ensure data integrity and prevent unilateral disruption, ProjectFlow implements a two-tier approval mechanism:
- Admins propose critical project modifications (Deadline extensions, Priority escalations, Status overrides).
- Managers review pending proposals in their dashboard and must explicitly **Approve** or **Reject** the changes before the backend state synchronizes.

### 4. High-Fidelity Kanban Board & Task Sync
- Fully interactive, drag-and-drop Kanban board categorized by `Pending`, `In Progress`, and `Completed`.
- Real-time client-side synchronization ensuring that task completion instantly reflects in the global **System Activity** tracker and project completion percentages.

### 5. Live System Activity Engine
Replaces static mock logs with a fully dynamic activity stream computed in real-time from active project initializations, task status updates, and administrative overrides.

---

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS (Vanilla Utility CSS), Framer Motion (Smooth Micro-Animations & Page Transitions), Lucide React (Premium Vector Icons).
- **Backend**: Node.js, Express.js, RESTful API Architecture, JWT (JSON Web Tokens) Authentication, Bcryptjs (Password Hashing).
- **Database**: PostgreSQL (Hosted on Supabase) with robust relational constraints and cascading deletions.

---

## 📦 Pre-Configured Demo Accounts

For seamless evaluation, ProjectFlow includes 5 pre-configured demo accounts. You can select any of these accounts directly from the Login page or enter their credentials manually:

| Full Name | Role | Email Address | Default Password | Access Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Rohith (Admin)** | `Admin` | `admin@projectflow.io` | `password123` | Executive Oversight |
| **Ramesh Kumar** | `Manager` | `manager@projectflow.io` | `password123` | Portfolio Management |
| **Suresh Sharma** | `Manager` | `suresh@projectflow.io` | `password123` | Portfolio Management |
| **Rahul Varma** | `Member` | `member@projectflow.io` | `password123` | General Access |
| **Mukesh Singh** | `Member` | `mukesh@projectflow.io` | `password123` | General Access |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate user and receive JWT & profile payload
- `GET /api/auth/me` - Retrieve current authenticated user profile
- `POST /api/auth/logout` - Invalidate session

### Projects (`/api/projects`)
- `GET /api/projects` - Retrieve all projects (filtered dynamically by user role)
- `POST /api/projects` - Initialize a new project enterprise (Admin/Manager)
- `DELETE /api/projects/:id` - Decommission a project

### Tasks (`/api/tasks`)
- `GET /api/tasks` - Retrieve all project deliverables
- `POST /api/tasks` - Create a new task deliverable
- `PATCH /api/tasks/:id` - Update task status, priority, or assignee
- `DELETE /api/tasks/:id` - Remove a task deliverable

### Admin & Workflows (`/api/requests` & `/api/admin`)
- `GET /api/admin/stats` - Retrieve global platform health metrics
- `GET /api/admin/users` - List all active organization members
- `POST /api/requests` - Propose a project override (Admin)
- `GET /api/requests/manager` - View pending override proposals (Manager)
- `PATCH /api/requests/:id/handle` - Execute Approval or Rejection of proposal (Manager)

### Notifications (`/api/notifications`)
- `POST /api/notifications` - Dispatch an Admin Directive or system alert
- `GET /api/notifications` - Retrieve active alerts for the authenticated user
- `PATCH /api/notifications/:id/read` - Mark a specific alert as acknowledged
- `PATCH /api/notifications/read-all` - Dismiss all active notifications

---

## 🔐 Role Permissions Matrix

| Capability | Admin | Manager | Member |
| :--- | :--- | :--- | :--- |
| **Executive Oversight Portal** | ✅ | ❌ | ❌ |
| **Dispatch Admin Directives** | ✅ | ❌ | ❌ |
| **Propose Project Overrides** | ✅ | ❌ | ❌ |
| **Approve/Reject Overrides** | ❌ | ✅ | ❌ |
| **Create & Manage Projects** | ✅ | ✅ | ❌ |
| **Create & Assign Tasks** | ✅ | ✅ | ❌ |
| **Update Task Progress** | ✅ | ✅ | ✅ |
| **View System Activity Stream** | ✅ | ✅ | ✅ |

---

## 🛠 Getting Started & Installation Guide

### 1. Database Setup (Supabase)
To ensure your database perfectly synchronizes all 5 demo accounts without conflict, execute the `database.sql` script in your **Supabase SQL Editor**. 

> [!IMPORTANT]
> The seed script utilizes `ON CONFLICT (id) DO UPDATE` to guarantee that existing rows are updated and missing demo users (like Suresh and Mukesh) are forcefully inserted with correct password hashes.

### 2. Environment Configuration
Create a `.env` file in both the `backend` and `frontend` directories:

**`/backend/.env`**:
```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
```

**`/frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Backend Initialization
Open a terminal and start the Express server:
```bash
cd backend
npm install
npm run dev
```
*The backend will initialize and listen on port 5000.*

### 4. Frontend Initialization
Open a second terminal and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*Open the local Vite URL (e.g., `http://localhost:5173`) in your browser to experience ProjectFlow.*
