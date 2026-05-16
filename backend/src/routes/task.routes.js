import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(authenticateToken, createTask)
  .get(authenticateToken, getTasks);

router.route('/:id')
  .put(authenticateToken, updateTask)
  .delete(authenticateToken, deleteTask);

export default router;
