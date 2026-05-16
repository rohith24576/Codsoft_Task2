-- 0. Clean up existing schema (Drop in reverse order of creation)
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.admin_requests CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

-- 1. Create Custom Types
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Member');
CREATE TYPE project_status AS ENUM ('Planning', 'In Progress', 'Completed');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Done');
CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Rejected');

-- 2. Users Table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'Member'::user_role,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'Planning'::project_status,
    deadline TIMESTAMP WITH TIME ZONE,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'To Do'::task_status,
    priority task_priority DEFAULT 'Medium'::task_priority,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Team Members Table
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- 6. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'Info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Admin Requests Table
CREATE TABLE public.admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    manager_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL, -- e.g., 'Deadline Extension', 'Priority Change'
    details JSONB NOT NULL, -- Stores requested changes (e.g., { "new_deadline": "2026-12-31" })
    status request_status DEFAULT 'Pending'::request_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'Project', 'Task', 'Member'
    entity_id UUID NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Comments Table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Seed Initial Demo Accounts & Enterprise Data
-- Note: Password is 'password123' hashed with bcrypt
INSERT INTO public.users (id, email, full_name, password, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@projectflow.io', 'System Administrator', '$2a$10$Xm7V4P3I6U.Yv0.z8.H6u.z.D5y.Z6y.V8y.W7y.X8y.Y9y.Z0y', 'Admin'),
('22222222-2222-2222-2222-222222222222', 'manager@projectflow.io', 'Rajesh Kumar', '$2a$10$Xm7V4P3I6U.Yv0.z8.H6u.z.D5y.Z6y.V8y.W7y.X8y.Y9y.Z0y', 'Manager'),
('33333333-3333-3333-3333-333333333333', 'priya@projectflow.io', 'Priya Sharma', '$2a$10$Xm7V4P3I6U.Yv0.z8.H6u.z.D5y.Z6y.V8y.W7y.X8y.Y9y.Z0y', 'Manager'),
('44444444-4444-4444-4444-444444444444', 'member@projectflow.io', 'Team Member', '$2a$10$Xm7V4P3I6U.Yv0.z8.H6u.z.D5y.Z6y.V8y.W7y.X8y.Y9y.Z0y', 'Member'),
('55555555-5555-5555-5555-555555555555', 'neha@projectflow.io', 'Neha Singh', '$2a$10$Xm7V4P3I6U.Yv0.z8.H6u.z.D5y.Z6y.V8y.W7y.X8y.Y9y.Z0y', 'Member')
ON CONFLICT (email) DO NOTHING;

-- 11. Seed Projects
INSERT INTO public.projects (id, name, description, status, deadline, owner_id) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'Horizon AI Integration', 'Developing a neural network for real-time predictive analytics and automation.', 'In Progress', '2026-12-31', '22222222-2222-2222-2222-222222222222'),
('aaaa2222-2222-2222-2222-222222222222', 'Stealth Mode UI Redesign', 'Crafting a next-gen, glassmorphic design system for the entire platform suite.', 'Completed', '2026-04-15', '22222222-2222-2222-2222-222222222222'),
('aaaa3333-3333-3333-3333-333333333333', 'Genesis Project', 'The foundation layer for our decentralized architecture and data integrity.', 'In Progress', '2026-10-31', '22222222-2222-2222-2222-222222222222'),
('aaaa4444-4444-4444-4444-444444444444', 'Z-Cloud Core Engine', 'Scaling our infrastructure to handle petabytes of engineering data across regions.', 'In Progress', '2026-11-30', '33333333-3333-3333-3333-333333333333'),
('aaaa5555-5555-5555-5555-555555555555', 'Gamma Security Overhaul', 'Implementing zero-trust architecture and automated vulnerability scanning across clusters.', 'Planning', '2026-09-30', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 12. Seed Team Members
INSERT INTO public.team_members (project_id, user_id, role) VALUES
('aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Member'),
('aaaa1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Member'),
('aaaa2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Member'),
('aaaa3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'Member'),
('aaaa4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Member'),
('aaaa5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Member')
ON CONFLICT DO NOTHING;

-- 13. Seed Tasks
INSERT INTO public.tasks (project_id, title, description, status, priority, assignee_id, deadline) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'Architect Neural Network Models', 'Design the core tensor layers for real-time predictive analytics.', 'In Progress', 'High', '44444444-4444-4444-4444-444444444444', '2026-06-15'),
('aaaa1111-1111-1111-1111-111111111111', 'Implement Data Ingestion Pipeline', 'Build robust Kafka brokers to stream telemetry data into the analytics engine.', 'To Do', 'Medium', '55555555-5555-5555-5555-555555555555', '2026-07-01'),
('aaaa1111-1111-1111-1111-111111111111', 'Optimize API Latency', 'Reduce GraphQL query response times below 50ms using Redis caching.', 'Done', 'High', '44444444-4444-4444-4444-444444444444', '2026-05-10'),
('aaaa2222-2222-2222-2222-222222222222', 'Finalize Design Tokens', 'Export Figma tokens to CSS variables for dark mode and glassmorphic surfaces.', 'Done', 'Medium', '44444444-4444-4444-4444-444444444444', '2026-04-10'),
('aaaa3333-3333-3333-3333-333333333333', 'Establish Zero-Knowledge Proofs', 'Integrate zk-SNARKs for private transactions across the decentralized ledger.', 'In Progress', 'High', '55555555-5555-5555-5555-555555555555', '2026-08-15'),
('aaaa4444-4444-4444-4444-444444444444', 'Deploy Multi-Region Kubernetes Clusters', 'Set up automated failover and geo-replication across AWS and GCP regions.', 'To Do', 'High', '44444444-4444-4444-4444-444444444444', '2026-09-01')
ON CONFLICT DO NOTHING;
