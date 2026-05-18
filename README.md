# 🚀 ProjectFlow | Premium Enterprise SaaS



**ProjectFlow** is a modern, high-fidelity project management and administrative oversight platform built for enterprise engineering teams. It provides a beautiful, seamless workspace that connects top-level executives, portfolio managers, and executing team members through a secure, dual-governance workflow.


---

## 🌐 Live Production Ecosystem

Experience the fully deployed ProjectFlow platform live. Our architecture is globally distributed across top-tier cloud providers for maximum speed, reliability, and enterprise-grade security.

| Architecture Layer | Cloud Provider | URL | Purpose & Capabilities |
| :--- | :--- | :--- | :--- |
| **🎨 Client Application** | **Vercel** | [https://project-flow-ochre.vercel.app/](https://project-flow-ochre.vercel.app/) | Global Edge CDN, instant page loads, and fully responsive VIP Gold & Charcoal UI. |
| **🗄️ Database Grid** | **Supabase (PostgreSQL)** | Supabase Cloud Cluster | Fully managed cloud relational database ensuring secure user, project, and task persistence with ACID compliance. |

> **💡 Demo Tip:** You can explore the platform instantly using the pre-configured demo accounts on the login portal—experience the Admin, Manager, and Member workspaces with a single click!

---

## 💎 Premium UI & Brand Identity

ProjectFlow is designed from the ground up to feel like an elite executive command center:
- **VIP Gold & Charcoal Aesthetic**: A luxurious, high-contrast visual palette pairing rich gold accents (`#f59e0b` / `#fbbf24`) with elegant charcoal slate (`#1e293b`).
- **Concentric Architectural Branding**: Powered by the clean, professional `Layers` icon symbolizing multi-tier enterprise architecture and structured project flow across the navigation bar and browser tab favicon.
- **Glassmorphic Bento Grids**: Modern, asymmetric UI layouts offering instant visual hierarchy for executive metrics, system activity streams, and user profiles.

---

## ✨ Key Features & How It Works (In Plain English)

### 1. Role-Based Command Centers
Every user gets a tailored experience based on their specific job in the organization:
- **Executive Oversight (Admin)**: A high-level command center where executives can monitor all company projects, check system health, and issue top-down directives.
- **Portfolio Management (Manager)**: A management dashboard where project leads can create new projects, assign team members, create deliverables, and review pending administrative requests.
- **General Access (Member)**: A clean, focused workspace where team members see their assigned deliverables, update progress, and interact with the Kanban board.

### 2. Direct Admin Directive System
Admins don't have to rely on external chat apps. If priorities change, an Admin can dispatch a real-time **Admin Directive** directly from the project dashboard to specific team members or the entire project team. These urgent messages appear instantly in the user's **Notification Center**.

### 3. The Admin-Manager Dual-Governance Workflow
To keep project data safe and prevent unexpected changes, ProjectFlow uses a two-step approval system:
- **Step 1 (Propose)**: An Admin requests a critical change (like extending a deadline, changing project status, or escalating priority).
- **Step 2 (Review & Approve)**: The assigned Manager sees the pending proposal in their dashboard and must explicitly click **Approve** or **Reject**. The database only updates after the Manager approves, keeping everyone perfectly aligned.

### 4. Interactive Drag-and-Drop Kanban Board
- Team members and managers can easily drag tasks between `Pending`, `In Progress`, and `Completed` columns.
- Moving a task instantly updates the project's overall completion percentage and logs a real-time event in the global **System Activity** feed.

### 5. Live System Activity Stream
Say goodbye to fake mock data. The System Activity section dynamically generates live feed updates whenever a project is created, a task is completed, or an administrative override is approved.

---

## 📂 Complete Folder Structure

Here is how the entire full-stack project is organized:

```text
ProjectFlow/
├── backend/                        # Node.js & Express API Server
│   ├── src/
│   │   ├── config/                 # Database configuration (db.js connecting to Supabase)
│   │   ├── controllers/            # Business logic (auth, project, task, admin, notification)
│   │   ├── middleware/             # JWT Authentication & Role verification middleware
│   │   └── routes/                 # Express API endpoints
│   ├── .env                        # Backend environment variables (PORT, DATABASE_URL, JWT_SECRET)
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Main application entry point
│
├── frontend/                       # React.js & Tailwind CSS Client
│   ├── public/                     # Static assets (including custom favicon.svg)
│   ├── src/
│   │   ├── components/             # Reusable UI widgets (KanbanBoard, NotificationCenter, Navbar, Modals)
│   │   ├── context/                # Global React Context (AuthContext.jsx for session state)
│   │   ├── layouts/                # Page wrappers (MainLayout.jsx with VIP Gold & Charcoal navbar)
│   │   ├── pages/                  # Main views (Login, Register, Dashboard, AdminDashboard, Projects, Tasks)
│   │   ├── App.jsx                 # Root React component & Router configuration
│   │   ├── index.css               # Vanilla CSS utilities & Tailwind directives
│   │   └── main.jsx                # DOM rendering entry point
│   ├── .env                        # Frontend environment variables (VITE_API_URL)
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite bundler configuration
│
├── database.sql                    # Complete Supabase PostgreSQL Schema & Seed Data
└── README.md                       # Project documentation
```

---

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion (Smooth Micro-Animations & Page Transitions), Lucide React (Premium Vector Icons).
- **Backend**: Node.js, Express.js, RESTful API Architecture, JSON Web Tokens (JWT) for secure authentication, Bcryptjs for password hashing.
- **Database**: PostgreSQL (Hosted on Supabase) featuring robust relational constraints, foreign key mappings, and cascading deletions.
- **Deployment**: Vercel (Frontend Client) & postgreSQL/Supabase (Backend & Database).

---

## 📦 Pre-Configured Demo Accounts

Want to test the platform immediately? We have set up 5 pre-configured demo accounts. You can click any of them on the Login page for instant one-click access, or log in manually using the table below:

| Full Name | Role | Email Address | Default Password | Access Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Rohith (Admin)** | `Admin` | `admin@projectflow.io` | `projectflow123` | Executive Oversight |
| **Ramesh Kumar** | `Manager` | `manager@projectflow.io` | `projectflow123` | Portfolio Management |
| **Suresh Sharma** | `Manager` | `suresh@projectflow.io` | `projectflow123` | Portfolio Management |
| **Rahul Varma** | `Member` | `member@projectflow.io` | `projectflow123` | General Access |
| **Mukesh Singh** | `Member` | `mukesh@projectflow.io` | `projectflow123` | General Access |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Verify credentials and return JWT session token
- `GET /api/auth/me` - Get profile details of the currently logged-in user
- `POST /api/auth/logout` - End current user session

### Projects (`/api/projects`)
- `GET /api/projects` - Get all projects (automatically filtered by the user's role)
- `POST /api/projects` - Create a new project (Restricted to Admins & Managers)
- `DELETE /api/projects/:id` - Delete a project from the system

### Tasks (`/api/tasks`)
- `GET /api/tasks` - Get all deliverables across projects
- `POST /api/tasks` - Create a new task deliverable
- `PATCH /api/tasks/:id` - Update task status (e.g., In Progress -> Completed)
- `DELETE /api/tasks/:id` - Delete a task deliverable

### Admin & Workflows (`/api/requests` & `/api/admin`)
- `GET /api/admin/stats` - Get company-wide statistics for the executive dashboard
- `GET /api/admin/users` - List all registered team members in the company
- `POST /api/requests` - Admin proposes a project override
- `GET /api/requests/manager` - Manager views all pending override proposals
- `PATCH /api/requests/:id/handle` - Manager approves or rejects the proposal

### Notifications (`/api/notifications`)
- `POST /api/notifications` - Send an Admin Directive or system alert
- `GET /api/notifications` - Get all unread alerts for the current user
- `PATCH /api/notifications/:id/read` - Mark a specific alert as read
- `PATCH /api/notifications/read-all` - Clear all notifications from the panel

---

## 🔐 Role Permissions Matrix

Here is a simple breakdown of who can do what inside ProjectFlow:

| Capability | Admin | Manager | Member |
| :--- | :--- | :--- | :--- |
| **Access Executive Oversight Portal** | ✅ | ❌ | ❌ |
| **Dispatch Admin Directives** | ✅ | ❌ | ❌ |
| **Propose Project Overrides** | ✅ | ❌ | ❌ |
| **Approve/Reject Overrides** | ❌ | ✅ | ❌ |
| **Create & Manage Projects** | ✅ | ✅ | ❌ |
| **Create & Assign Tasks** | ✅ | ✅ | ❌ |
| **Update Task Progress (Kanban)** | ✅ | ✅ | ✅ |
| **View Live System Activity Feed** | ✅ | ✅ | ✅ |

---

## 🚀 Getting Started & Local Installation Guide

Follow these simple steps to run ProjectFlow on your local machine:

### 1. Database Setup (Supabase)
1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of `database.sql` from this repository and run it.

> [!IMPORTANT]
> The `database.sql` script uses `ON CONFLICT (id) DO UPDATE` to ensure that all 5 demo accounts (including Suresh and Mukesh) are correctly created with their encrypted `projectflow123` credentials.

### 2. Environment Configuration
Create a `.env` file inside both the `backend` and `frontend` folders:

**Inside `/backend/.env`**:
```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
```

**Inside `/frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start the Backend Server
Open your terminal, navigate to the backend folder, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
*Your backend API will now be running on `http://localhost:5000`.*

### 4. Start the Frontend Client
Open a second terminal window, navigate to the frontend folder, install dependencies, and start the React client:
```bash
cd frontend
npm install
npm run dev
```
*Click the local URL (e.g., `http://localhost:5173`) in your terminal to open ProjectFlow in your browser!*

---

## 🤝 How to Contribute

We love contributions! Follow these steps to help improve ProjectFlow:

1. **Fork the Project**: Click the Fork button at the top of the repository.
2. **Create a Feature Branch**: 
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes**: Use descriptive commit messages:
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**: Submit your PR for review and we'll merge it after testing.

### 📜 Contribution Rules:
- Maintain consistent coding styles (ESLint/Prettier).
- Document any new API endpoints in the README.
- Ensure all new components are fully responsive.

---

## 👤 Developer Profile

**Rohith**  
*Lead Architect & Full Stack Developer*

- **GitHub**: [@rohith24576](https://github.com/rohith24576)
- **Portfolio**: [https://rohith24576.github.io/Rohithportfolio/](https://rohith24576.github.io/Rohithportfolio/)
- **Email**: [rohithjayanthi06@gmail.com](mailto:rohithjayanthi06@gmail.com)

---
🏆 *Developed with passion for the Codsoft Web Development Fellowship.*
