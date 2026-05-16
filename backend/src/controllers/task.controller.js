import pool from '../config/db.js';

export const createTask = async (req, res) => {
  const { project_id, title, description, status, priority, assignee_id, deadline } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [project_id, title, description, status || 'To Do', priority || 'Medium', assignee_id || req.user.id, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'Admin') {
      result = await pool.query(`
        SELECT t.*, p.name as project_name, u.full_name as assignee_name 
        FROM tasks t 
        LEFT JOIN projects p ON t.project_id = p.id 
        LEFT JOIN users u ON t.assignee_id = u.id
      `);
    } else if (req.user.role === 'Manager') {
      result = await pool.query(`
        SELECT t.*, p.name as project_name, u.full_name as assignee_name 
        FROM tasks t 
        LEFT JOIN projects p ON t.project_id = p.id 
        LEFT JOIN users u ON t.assignee_id = u.id 
        WHERE p.owner_id = $1 OR p.id IN (SELECT project_id FROM team_members WHERE user_id = $1)
      `, [req.user.id]);
    } else {
      result = await pool.query(`
        SELECT t.*, p.name as project_name, u.full_name as assignee_name 
        FROM tasks t 
        LEFT JOIN projects p ON t.project_id = p.id 
        LEFT JOIN users u ON t.assignee_id = u.id 
        WHERE t.assignee_id = $1 OR t.project_id IN (SELECT project_id FROM team_members WHERE user_id = $1)
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { title, description, status, priority, assignee_id, deadline } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, assignee_id = $5, deadline = $6 WHERE id = $7 RETURNING *',
      [title, description, status, priority, assignee_id, deadline, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
