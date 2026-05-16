import express from 'express';
import { createRequest, getManagerRequests, handleRequest } from '../controllers/request.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole(['Admin']), createRequest);
router.get('/manager', authenticateToken, authorizeRole(['Manager']), getManagerRequests);
router.patch('/:id/handle', authenticateToken, authorizeRole(['Manager']), handleRequest);

export default router;
