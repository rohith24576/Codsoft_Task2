import pool from './src/config/db.js';
import bcrypt from 'bcryptjs';

const seedWorkspace = async () => {
  try {
    console.log('🌱 Seeding database with synchronized accounts and projects...');
    
    // Hash common password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('projectflow123', salt);

    // 1. Clean up existing data in reverse order of foreign keys
    console.log('🧹 Cleaning up existing records...');
    await pool.query('DELETE FROM comments CASCADE');
    await pool.query('DELETE FROM activity_logs CASCADE');
    await pool.query('DELETE FROM admin_requests CASCADE');
    await pool.query('DELETE FROM notifications CASCADE');
    await pool.query('DELETE FROM team_members CASCADE');
    await pool.query('DELETE FROM tasks CASCADE');
    await pool.query('DELETE FROM projects CASCADE');
    await pool.query('DELETE FROM users CASCADE');

    // 2. Insert Users
    console.log('👥 Inserting users...');
    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@projectflow.io',
        full_name: 'Rohith (Admin)',
        password: hashedPassword,
        role: 'Admin'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'manager@projectflow.io',
        full_name: 'Ramesh Kumar',
        password: hashedPassword,
        role: 'Manager'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'suresh@projectflow.io',
        full_name: 'Suresh Sharma',
        password: hashedPassword,
        role: 'Manager'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'member@projectflow.io',
        full_name: 'Rahul Varma',
        password: hashedPassword,
        role: 'Member'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        email: 'mukesh@projectflow.io',
        full_name: 'Mukesh Singh',
        password: hashedPassword,
        role: 'Member'
      }
    ];

    for (const u of users) {
      await pool.query(
        'INSERT INTO users (id, email, full_name, password, role) VALUES ($1, $2, $3, $4, $5)',
        [u.id, u.email, u.full_name, u.password, u.role]
      );
      console.log(`✅ Created user: ${u.email} (${u.role})`);
    }

    // 3. Insert Projects
    console.log('📁 Inserting projects...');
    const projects = [
      {
        id: 'aaaa1111-1111-1111-1111-111111111111',
        name: 'Horizon AI Integration',
        description: 'Developing a neural network for real-time predictive analytics and automation.',
        status: 'In Progress',
        deadline: '2026-12-31',
        owner_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'aaaa2222-2222-2222-2222-222222222222',
        name: 'Stealth Mode UI Redesign',
        description: 'Crafting a next-gen, glassmorphic design system for the entire platform suite.',
        status: 'Completed',
        deadline: '2026-04-15',
        owner_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'aaaa3333-3333-3333-3333-333333333333',
        name: 'Genesis Project',
        description: 'The foundation layer for our decentralized architecture and data integrity.',
        status: 'In Progress',
        deadline: '2026-10-31',
        owner_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        id: 'aaaa4444-4444-4444-4444-444444444444',
        name: 'Z-Cloud Core Engine',
        description: 'Scaling our infrastructure to handle petabytes of engineering data across regions.',
        status: 'In Progress',
        deadline: '2026-11-30',
        owner_id: '33333333-3333-3333-3333-333333333333'
      },
      {
        id: 'aaaa5555-5555-5555-5555-555555555555',
        name: 'Gamma Security Overhaul',
        description: 'Implementing zero-trust architecture and automated vulnerability scanning across clusters.',
        status: 'Planning',
        deadline: '2026-09-30',
        owner_id: '33333333-3333-3333-3333-333333333333'
      }
    ];

    for (const p of projects) {
      await pool.query(
        'INSERT INTO projects (id, name, description, status, deadline, owner_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.id, p.name, p.description, p.status, p.deadline, p.owner_id]
      );
      console.log(`✅ Created project: ${p.name}`);
    }

    // 4. Insert Team Members
    console.log('👥 Assigning team members to projects...');
    const members = [
      { project_id: 'aaaa1111-1111-1111-1111-111111111111', user_id: '44444444-4444-4444-4444-444444444444', role: 'Member' },
      { project_id: 'aaaa1111-1111-1111-1111-111111111111', user_id: '55555555-5555-5555-5555-555555555555', role: 'Member' },
      { project_id: 'aaaa2222-2222-2222-2222-222222222222', user_id: '44444444-4444-4444-4444-444444444444', role: 'Member' },
      { project_id: 'aaaa3333-3333-3333-3333-333333333333', user_id: '55555555-5555-5555-5555-555555555555', role: 'Member' },
      { project_id: 'aaaa4444-4444-4444-4444-444444444444', user_id: '44444444-4444-4444-4444-444444444444', role: 'Member' },
      { project_id: 'aaaa5555-5555-5555-5555-555555555555', user_id: '55555555-5555-5555-5555-555555555555', role: 'Member' }
    ];

    for (const m of members) {
      await pool.query(
        'INSERT INTO team_members (project_id, user_id, role) VALUES ($1, $2, $3)',
        [m.project_id, m.user_id, m.role]
      );
    }
    console.log('✅ Assigned project team members.');

    // 5. Insert Tasks
    console.log('📋 Creating tasks...');
    const tasks = [
      {
        project_id: 'aaaa1111-1111-1111-1111-111111111111',
        title: 'Architect Neural Network Models',
        description: 'Design the core tensor layers for real-time predictive analytics.',
        status: 'In Progress',
        priority: 'High',
        assignee_id: '44444444-4444-4444-4444-444444444444',
        deadline: '2026-06-15'
      },
      {
        project_id: 'aaaa1111-1111-1111-1111-111111111111',
        title: 'Implement Data Ingestion Pipeline',
        description: 'Build robust Kafka brokers to stream telemetry data into the analytics engine.',
        status: 'To Do',
        priority: 'Medium',
        assignee_id: '55555555-5555-5555-5555-555555555555',
        deadline: '2026-07-01'
      },
      {
        project_id: 'aaaa1111-1111-1111-1111-111111111111',
        title: 'Optimize API Latency',
        description: 'Reduce GraphQL query response times below 50ms using Redis caching.',
        status: 'Done',
        priority: 'High',
        assignee_id: '44444444-4444-4444-4444-444444444444',
        deadline: '2026-05-10'
      },
      {
        project_id: 'aaaa2222-2222-2222-2222-222222222222',
        title: 'Finalize Design Tokens',
        description: 'Export Figma tokens to CSS variables for dark mode and glassmorphic surfaces.',
        status: 'Done',
        priority: 'Medium',
        assignee_id: '44444444-4444-4444-4444-444444444444',
        deadline: '2026-04-10'
      },
      {
        project_id: 'aaaa3333-3333-3333-3333-333333333333',
        title: 'Establish Zero-Knowledge Proofs',
        description: 'Integrate zk-SNARKs for private transactions across the decentralized ledger.',
        status: 'In Progress',
        priority: 'High',
        assignee_id: '55555555-5555-5555-5555-555555555555',
        deadline: '2026-08-15'
      },
      {
        project_id: 'aaaa4444-4444-4444-4444-444444444444',
        title: 'Deploy Multi-Region Kubernetes Clusters',
        description: 'Set up automated failover and geo-replication across AWS and GCP regions.',
        status: 'To Do',
        priority: 'High',
        assignee_id: '44444444-4444-4444-4444-444444444444',
        deadline: '2026-09-01'
      }
    ];

    for (const t of tasks) {
      await pool.query(
        'INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [t.project_id, t.title, t.description, t.status, t.priority, t.assignee_id, t.deadline]
      );
    }
    console.log('✅ Created tasks.');

    console.log('✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedWorkspace();
