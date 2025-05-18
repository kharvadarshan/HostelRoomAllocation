import express from 'express'
const router = express.Router();
import {
  CreateRoom,
  AllocatePerson,
  GetRoomById,
  GetAllRoom,
  DeAllocateUser,
  UpdateRoom,
  DeleteRoom
} from '../controllers/roomController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Protected admin routes
router.post('/', protect, admin, CreateRoom);
router.get('/', GetAllRoom);
router.get('/:id', GetRoomById);
router.patch('/:id', protect, admin, UpdateRoom);
router.delete('/:id', protect, admin, DeleteRoom);

// User allocation routes
router.post('/user', protect, admin, AllocatePerson);
router.delete('/', protect, admin, DeAllocateUser);

export default router;
