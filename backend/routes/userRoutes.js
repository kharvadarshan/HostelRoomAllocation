import express from 'express';
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPhoto,
  deleteUserPhoto,
  getUnallocatedUsers,
  getAllocatedUsers,
  searchUsers
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', upload.single('photo'), registerUser);

// Protected routes
router.route('/photo')
  .put(protect, upload.single('photo'), updateUserPhoto)
  .delete(protect, deleteUserPhoto);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.get('/search', protect, admin, searchUsers);
router.get('/unallocated', protect, admin, getUnallocatedUsers);
router.get('/allocated', protect, admin, getAllocatedUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, upload.single('photo'), updateUser)
  .delete(protect, admin, deleteUser);

export default router; 