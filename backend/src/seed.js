import pool from './config/db.js';
import bcrypt from 'bcryptjs';

const seedWorkspace = async () => {
  try {
    const password = await bcrypt.hash('password123', 10);
    
    console.log('⏳ Updating your Royal Workspace with Gmail accounts...');

    const users = [
      ['admin@gmail.com', 'System Admin', 'Admin'],
      ['member@gmail.com', 'Alex Johnson', 'Member'],
      ['manager@gmail.com', 'Project Manager', 'Manager']
    ];

    const seededUsers = [];

    for (const u of users) {
      try {
        const res = await pool.query(`
          INSERT INTO users (email, password, full_name, role) 
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
          RETURNING id, email, role
        `, [u[0], password, u[1], u[2]]);
        seededUsers.push(res.rows[0]);
        console.log(`✅ Created/Updated: ${u[0]}`);
      } catch (err) {
        if (u[2] === 'Manager') {
          console.warn(`⚠️ Manager account could not be created. Please run the database.sql in Supabase first!`);
        } else {
          console.error(`❌ Error creating ${u[0]}:`, err.message);
        }
      }
    }

    const admin = seededUsers.find(u => u.role === 'Admin');
    const member = seededUsers.find(u => u.role === 'Member');

    if (admin && member) {
      // 2. Create Projects
      const projects = [
        ['Web Portfolio Development', 'Build a modern, responsive personal portfolio website using React and Tailwind.', 'In Progress', admin.id],
        ['AI Image Classifier', 'Research and develop a neural network model to classify object categories in images.', 'Planning', admin.id],
        ['Java Inventory System', 'Develop a robust desktop application for managing warehouse stock and orders using Java FX.', 'Planning', admin.id]
      ];

      console.log('📁 Creating projects...');
      const projectIds = [];
      for (const p of projects) {
        const res = await pool.query(
          'INSERT INTO projects (name, description, status, creator_id) VALUES ($1, $2, $3, $4) RETURNING id',
          p
        );
        projectIds.push(res.rows[0].id);
      }

      // 3. Create Tasks
      const tasks = [
        [projectIds[0], 'Design UI Layout', 'Create wireframes and high-fidelity designs.', 'In Progress', 'High', member.id],
        [projectIds[0], 'Setup React Project', 'Initialize the Vite project.', 'Done', 'Medium', member.id],
        [projectIds[1], 'Data Collection', 'Gather images for training.', 'To Do', 'High', member.id],
        [projectIds[2], 'Database Schema', 'Design the SQL tables.', 'To Do', 'High', member.id]
      ];

      console.log('✅ Assigning tasks to Member...');
      for (const t of tasks) {
        await pool.query(
          'INSERT INTO tasks (project_id, title, description, status, priority, assignee_id) VALUES ($1, $2, $3, $4, $5, $6)',
          t
        );
      }
    }

    console.log('✨ Workspace updated successfully with @gmail.com accounts!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding workspace:', error);
    process.exit(1);
  }
};

seedWorkspace();
