import pool from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    const taskCount = await pool.query('SELECT COUNT(*) FROM tasks');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const completedProjects = await pool.query('SELECT COUNT(*) FROM projects WHERE status = \'Completed\'');
    
    res.json({
      totalUsers: parseInt(userCount.rows[0].count),
      totalProjects: parseInt(projectCount.rows[0].count),
      totalTasks: parseInt(taskCount.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      completedProjects: parseInt(completedProjects.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, full_name, role, avatar_url, is_active, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, email, is_active',
      [is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
