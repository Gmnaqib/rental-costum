const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUnits, getUnitById, createUnit, updateUnit, deleteUnit, getUnitAvailability } = require('../controllers/unit.controller');

const router = express.Router();

// Public/authenticated routes
router.get('/', authenticate, getAllUnits);
router.get('/:id', authenticate, getUnitById);
router.get('/:id/availability', authenticate, getUnitAvailability);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('code').notEmpty().withMessage('Kode unit wajib diisi.'),
    body('name').notEmpty().withMessage('Nama unit wajib diisi.'),
    body('sizeCategory').isIn(['S', 'M', 'L', 'XL', 'XXL']).withMessage('Kategori ukuran tidak valid.'),
  ],
  validate,
  createUnit
);

router.put('/:id', authenticate, authorize('admin'), updateUnit);
router.delete('/:id', authenticate, authorize('admin'), deleteUnit);

module.exports = router;
