import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getAllOrgUsers, addTeamMember, removeTeamMember } from '../controllers/project.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', authenticateToken, getAllOrgUsers);
router.post('/members', authenticateToken, addTeamMember);
router.delete('/members/:projectId/:userId', authenticateToken, removeTeamMember);

router.route('/')
  .post(authenticateToken, createProject)
  .get(authenticateToken, getProjects);

router.route('/:id')
  .get(authenticateToken, getProjectById)
  .put(authenticateToken, updateProject)
  .delete(authenticateToken, deleteProject);

export default router;
