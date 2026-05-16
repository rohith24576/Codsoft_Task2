import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(authenticateToken, createProject)
  .get(authenticateToken, getProjects);

router.route('/:id')
  .get(authenticateToken, getProjectById)
  .put(authenticateToken, updateProject)
  .delete(authenticateToken, deleteProject);

export default router;
