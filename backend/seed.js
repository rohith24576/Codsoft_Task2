import pool from './src/config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding demo accounts...');
    
    // Hash common password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        email: 'admin@projectflow.io',
        full_name: 'System Administrator',
        password: hashedPassword,
        role: 'Admin'
      },
      {
        email: 'manager@projectflow.io',
        full_name: 'Rajesh Kumar',
        password: hashedPassword,
        role: 'Manager'
      },
      {
        email: 'member@projectflow.io',
        full_name: 'Team Member',
        password: hashedPassword,
        role: 'Member'
      }
    ];

    for (const user of users) {
      // Check if user exists
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO users (email, full_name, password, role) VALUES ($1, $2, $3, $4)',
          [user.email, user.full_name, user.password, user.role]
        );
        console.log(`✅ Created ${user.role}: ${user.email}`);
      } else {
        console.log(`⏭️ ${user.role} already exists: ${user.email}`);
      }
    }

    console.log('✨ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
