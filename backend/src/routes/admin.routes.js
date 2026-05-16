import express from 'express';
import { getDashboardStats, getAllUsers, updateUserRole, deleteUser, toggleUserStatus } from '../controllers/admin.controller.js';
import { authenticateToken, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
