import pool from '../config/db.js';

export const createRequest = async (req, res) => {
  const { manager_id, project_id, request_type, details } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO admin_requests (admin_id, manager_id, project_id, request_type, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, manager_id, project_id, request_type, details]
    );

    // Notify Manager
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [manager_id, 'New Admin Request', `Admin has requested a ${request_type} for project.`, 'Request']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getManagerRequests = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, p.name as project_name, u.full_name as admin_name FROM admin_requests r LEFT JOIN projects p ON r.project_id = p.id LEFT JOIN users u ON r.admin_id = u.id WHERE r.manager_id = $1 ORDER BY r.created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleRequest = async (req, res) => {
  const { status } = req.body; // 'Approved' or 'Rejected'
  const requestId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get request details
    const reqResult = await client.query('SELECT * FROM admin_requests WHERE id = $1', [requestId]);
    if (reqResult.rows.length === 0) throw new Error('Request not found');
    const request = reqResult.rows[0];

    // 2. Update request status
    await client.query('UPDATE admin_requests SET status = $1 WHERE id = $2', [status, requestId]);

    // 3. If Approved, apply changes
    if (status === 'Approved') {
      const { project_id, request_type, details } = request;
      
      if (request_type === 'Deadline Extension' && details.new_deadline) {
        await client.query('UPDATE projects SET deadline = $1 WHERE id = $2', [details.new_deadline, project_id]);
      } else if (request_type === 'Status Update' && details.new_status) {
        await client.query('UPDATE projects SET status = $1 WHERE id = $2', [details.new_status, project_id]);
      }
      
      // Log activity
      await client.query(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'Approved Request', 'Project', project_id, `Request ${request_type} applied.`]
      );
    }

    // 4. Notify Admin
    await client.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [request.admin_id, `Request ${status}`, `Manager has ${status.toLowerCase()} your ${request.request_type} request.`, status === 'Approved' ? 'Success' : 'Error']
    );

    await client.query('COMMIT');
    res.json({ message: `Request ${status}` });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};
