# 🚀 ProjectFlow | Premium Enterprise SaaS

ProjectFlow is a high-fidelity, full-stack project management and collaboration platform designed for modern engineering teams. It bridges the gap between high-level administrative oversight and granular team execution with a sophisticated approval-based workflow.

## 💎 Key Features

- **Role-Based Command Centers**: Dedicated, premium dashboards for Admins, Managers, and Team Members.
- **Admin-Manager Approval Workflow**: Admins propose project overrides (Deadlines, Status, Priority) which Managers must explicitly Approve or Reject before the system synchronizes.
- **High-Fidelity Kanban Board**: Interactive, drag-and-drop task management with real-time status updates and layout animations.
- **Real-Time Notification Engine**: Global alert system tracking assignments, approvals, and system activities.
- **Bento-Style Analytics**: Visual, data-driven insights into system health, team velocity, and project distribution.
- **Universal Synchronization**: Real-time consistency across all dashboards powered by a robust PostgreSQL/Supabase backend.

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion (Animations), Lucide (Icons), Axios.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Database**: PostgreSQL (hosted on Supabase).

## 📡 API Reference

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - List all projects (filtered by role)
- `POST /api/projects` - Initialize new project (Admin/Manager)
- `DELETE /api/projects/:id` - Remove project from system

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new deliverable
- `PATCH /api/tasks/:id` - Update task status or details
- `DELETE /api/tasks/:id` - Remove task

### Admin & Workflows
- `GET /api/admin/stats` - Global platform metrics
- `GET /api/admin/users` - Manage all system users
- `POST /api/requests` - Admin propose modification
- `GET /api/requests/manager` - Manager view pending proposals
- `PATCH /api/requests/:id/handle` - Approve or Reject Admin request

### Notifications
- `GET /api/notifications` - Fetch user alerts
- `PATCH /api/notifications/:id/read` - Mark specific alert as read
- `PATCH /api/notifications/read-all` - Clear all notifications

## 🔐 Role Permissions

| Feature | Admin | Manager | Member |
| :--- | :--- | :--- | :--- |
| Global Command Center | ✅ | ❌ | ❌ |
| Create Projects | ✅ | ✅ | ❌ |
| Modify Database Directly| ❌ | ✅ | ❌ |
| Request Modification | ✅ | ❌ | ❌ |
| Approve/Reject Requests| ❌ | ✅ | ❌ |
| Kanban Interaction | ✅ | ✅ | ✅ |
| Manage All Users | ✅ | ❌ | ❌ |

## 🚀 Deployment

- **Frontend**: Optimized for Netlify / Vercel.
- **Backend**: Production-ready for Render / Heroku.
- **Database**: Hosted on Supabase.

## 🛠 Getting Started

### 1. Database Setup
Go to your Supabase project dashboard and run the `database.sql` script in the SQL Editor.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
