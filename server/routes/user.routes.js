const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUser, deleteUser, getProfile, updateProfile } = require('../controllers/user.controller');

const router = express.Router();

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
