import pool from '../config/db.js';

export const createProject = async (req, res) => {
  const { name, description, deadline } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, deadline, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, deadline, req.user.id]
    );
    const project = result.rows[0];

    // Add creator as team member automatically
    await pool.query(
      'INSERT INTO team_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, req.user.id, 'Manager']
    );

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'Admin') {
      result = await pool.query(`
        SELECT p.*, 
               COALESCE(json_agg(json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email, 'role', tm.role)) FILTER (WHERE u.id IS NOT NULL), '[]') as team_members 
        FROM projects p 
        LEFT JOIN team_members tm ON p.id = tm.project_id 
        LEFT JOIN users u ON tm.user_id = u.id 
        GROUP BY p.id
      `);
    } else if (req.user.role === 'Manager') {
      result = await pool.query(`
        SELECT p.*, 
               COALESCE(json_agg(json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email, 'role', tm.role)) FILTER (WHERE u.id IS NOT NULL), '[]') as team_members 
        FROM projects p 
        LEFT JOIN team_members tm ON p.id = tm.project_id 
        LEFT JOIN users u ON tm.user_id = u.id 
        WHERE p.owner_id = $1 OR p.id IN (SELECT project_id FROM team_members WHERE user_id = $1)
        GROUP BY p.id
      `, [req.user.id]);
    } else {
      result = await pool.query(`
        SELECT p.*, 
               COALESCE(json_agg(json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email, 'role', tm.role)) FILTER (WHERE u.id IS NOT NULL), '[]') as team_members 
        FROM projects p 
        LEFT JOIN team_members tm ON p.id = tm.project_id 
        LEFT JOIN users u ON tm.user_id = u.id 
        WHERE p.id IN (SELECT project_id FROM team_members WHERE user_id = $1)
        GROUP BY p.id
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const project = projectResult.rows[0];

    const tasksResult = await pool.query('SELECT * FROM tasks WHERE project_id = $1', [project.id]);
    const membersResult = await pool.query(
      'SELECT tm.*, u.full_name, u.email, u.avatar_url FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.project_id = $1',
      [project.id]
    );

    res.json({
      ...project,
      tasks: tasksResult.rows,
      team_members: membersResult.rows
    });
  } catch (error) {
    res.status(404).json({ message: 'Project not found' });
  }
};

export const updateProject = async (req, res) => {
  const { name, description, status, deadline } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, status = $3, deadline = $4 WHERE id = $5 RETURNING *',
      [name, description, status, deadline, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
