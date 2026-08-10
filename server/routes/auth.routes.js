const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nama wajib diisi.'),
    body('email').isEmail().withMessage('Format email tidak valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('phoneNumber').notEmpty().withMessage('Nomor telepon wajib diisi.'),
    body('address').notEmpty().withMessage('Alamat wajib diisi.'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Format email tidak valid.'),
    body('password').notEmpty().withMessage('Password wajib diisi.'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
